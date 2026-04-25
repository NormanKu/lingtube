import { Router, type Request, type Response } from 'express';
import { extractVideoId, fetchTranscript, fetchVideoTitle } from '../services/youtube.js';
import { transcriptRequestSchema } from '../schemas.js';
import { sanitizeMessage } from '../utils/sanitize.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const parsed = transcriptRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', issues: parsed.error.flatten() });
  }
  const { url, lang } = parsed.data;

  try {
    const videoId = extractVideoId(url.trim());
    if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    const [segments, title] = await Promise.all([
      fetchTranscript(videoId, lang || 'en'),
      fetchVideoTitle(videoId),
    ]);
    res.json({ videoId, title, segments });
  } catch (err) {
    const message = sanitizeMessage(err);
    console.error('Transcript fetch error:', message);
    if (message.includes('disabled') || message.includes('not found')) {
      return res.status(404).json({ error: 'No subtitles available for this video' });
    }
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

export default router;
