import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { videoDataSchema } from './schemas.js';
import { sanitizeMessage } from './utils/sanitize.js';
import { dailyBudgetMiddleware, tokenCapMiddleware } from './middleware/aiBudget.js';
import transcriptRouter from './routes/transcript.js';
import aiRouter from './routes/ai.js';
import aiConfigRouter from './routes/aiConfig.js';

interface VideoListEntry {
  videoId: string;
  title: string;
  lang: string;
  generatedAt: string;
  sentenceCount: number;
}

const LIST_CACHE_TTL_MS = 5 * 60 * 1000;

function parseAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Build the Express app without starting a listener.
 * Useful both for local dev (`app.ts` wraps this with listen)
 * and for serverless deployments (Vercel function handler).
 *
 * The `dataDir` option lets you override where pre-generated video JSON
 * is read from. On Vercel we bundle `data/` relative to the function,
 * so the caller passes the resolved path.
 */
export function createApp(options: { dataDir?: string } = {}) {
  const defaultDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'data'
  );
  const DATA_DIR = options.dataDir ?? defaultDir;

  const app = express();
  app.set('trust proxy', 1);

  const allowedOrigins = parseAllowedOrigins();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin / curl / server-to-server requests have no Origin header.
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'x-lingtube-api-key'],
      credentials: false,
    })
  );
  app.use(morgan('dev'));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', provider: process.env.AI_PROVIDER || 'none (CLI mode)' });
  });

  // General rate limit applies to all /api/* routes registered below this line.
  // Health check is registered earlier so monitors are not throttled.
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  // Stricter limit for AI calls — they cost money and have high latency.
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  app.use('/api/', generalLimiter);
  app.use('/api/analyze', aiLimiter, tokenCapMiddleware, dailyBudgetMiddleware);
  app.use('/api/ai/validate', aiLimiter);

  app.get('/api/data/:videoId', async (req: Request<{ videoId: string }>, res: Response) => {
    const { videoId } = req.params;
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }
    const filePath = path.join(DATA_DIR, `${videoId}.json`);

    let raw: unknown;
    try {
      raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        return res
          .status(404)
          .json({ error: 'No data for this video. Run: node cli/generate.js <YouTube URL>' });
      }
      console.error(`[${videoId}] Failed to read video data:`, sanitizeMessage(err));
      return res.status(500).json({ error: 'Failed to read video data' });
    }

    const result = videoDataSchema.safeParse(raw);
    if (!result.success) {
      console.warn(
        `[${videoId}] Schema validation failed:`,
        result.error.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`)
      );
      return res.status(422).json({ error: 'Corrupted video data file' });
    }

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

  // Listing scans every JSON file in DATA_DIR, which is O(N) on cold reads.
  // Cache the result with a short TTL so repeated client polls (and homepage
  // navigations) do not re-parse the whole library.
  let cachedList: VideoListEntry[] | null = null;
  let cachedListAt = 0;

  async function buildVideoList(): Promise<VideoListEntry[]> {
    let entries: string[];
    try {
      entries = await fs.readdir(DATA_DIR);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }
    const files = entries.filter((f) => f.endsWith('.json'));
    const results = await Promise.all(
      files.map(async (f) => {
        try {
          const data = JSON.parse(await fs.readFile(path.join(DATA_DIR, f), 'utf-8'));
          return {
            videoId: data.videoId as string,
            title: (data.title as string) || (data.videoId as string),
            lang: data.lang as string,
            generatedAt: data.generatedAt as string,
            sentenceCount: (data.sentences?.length as number) || 0,
          } satisfies VideoListEntry;
        } catch {
          return null;
        }
      })
    );
    return results.filter((v): v is VideoListEntry => v !== null);
  }

  app.get('/api/data', async (_req: Request, res: Response) => {
    if (cachedList && Date.now() - cachedListAt < LIST_CACHE_TTL_MS) {
      return res.json({ videos: cachedList });
    }
    try {
      const videos = await buildVideoList();
      cachedList = videos;
      cachedListAt = Date.now();
      res.json({ videos });
    } catch (err) {
      console.error('Failed to list videos:', sanitizeMessage(err));
      res.status(500).json({ error: 'Failed to list videos' });
    }
  });

  app.use('/api/transcript', transcriptRouter);
  app.use('/api/ai', aiConfigRouter);
  app.use('/api/analyze', aiRouter);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(sanitizeMessage(err.stack ?? err.message));
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
