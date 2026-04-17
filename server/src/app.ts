import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { videoDataSchema } from './schemas.js';
import transcriptRouter from './routes/transcript.js';
import aiRouter from './routes/ai.js';
import aiConfigRouter from './routes/aiConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', provider: process.env.AI_PROVIDER || 'none (CLI mode)' });
});

// Serve pre-generated data from CLI
app.get('/api/data/:videoId', (req: Request<{ videoId: string }>, res: Response) => {
  const { videoId } = req.params;
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }
  const filePath = path.join(DATA_DIR, `${videoId}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'No data for this video. Run: node cli/generate.js <YouTube URL>' });
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const result = videoDataSchema.safeParse(raw);
  if (!result.success) {
    console.warn('Invalid video data:', result.error.issues);
    return res.status(500).json({ error: 'Corrupted video data file' });
  }

  // Referential integrity: drop orphan cloze/fsi entries that reference missing sentences
  const sentenceIds = new Set(result.data.sentences.map((s) => s.id));
  const filteredCloze = result.data.clozeExercises.filter((e) => sentenceIds.has(e.sentenceId));
  const filteredFsi = result.data.fsiDrills.filter((d) => sentenceIds.has(d.sentenceId));

  const orphanClozeCount = result.data.clozeExercises.length - filteredCloze.length;
  const orphanFsiCount = result.data.fsiDrills.length - filteredFsi.length;
  if (orphanClozeCount > 0 || orphanFsiCount > 0) {
    console.warn(
      `[${videoId}] Dropped ${orphanClozeCount} orphan cloze(s) and ${orphanFsiCount} orphan FSI drill(s)`
    );
  }

  res.json({
    ...result.data,
    clozeExercises: filteredCloze,
    fsiDrills: filteredFsi,
  });
});

// List all available pre-generated videos
app.get('/api/data', (_req: Request, res: Response) => {
  if (!fs.existsSync(DATA_DIR)) {
    return res.json({ videos: [] });
  }
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  const videos = files
    .map((f) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8'));
        return {
          videoId: data.videoId as string,
          title: (data.title as string) || data.videoId,
          lang: data.lang as string,
          generatedAt: data.generatedAt as string,
          sentenceCount: (data.sentences?.length as number) || 0,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  res.json({ videos });
});

app.use('/api/transcript', transcriptRouter);
app.use('/api/ai', aiConfigRouter);
app.use('/api/analyze', aiRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`LingTube server running on port ${PORT}`);
});
