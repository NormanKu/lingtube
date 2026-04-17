import { Router, type Request, type Response } from 'express';
import type { TranscriptRequest, TranscriptResponse } from 'lingtube-shared';
import { extractVideoId, fetchTranscript, fetchVideoTitle } from '../services/youtube.js';

const router = Router();

router.post('/', async (req: Request<{}, {}, TranscriptRequest>, res: Response) => {
  try {
    const { url, lang } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const videoId = extractVideoId(url.trim());
    if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    const [segments, title] = await Promise.all([
      fetchTranscript(videoId, lang || 'en'),
      fetchVideoTitle(videoId),
    ]);
    const response: TranscriptResponse = { videoId, title, segments };
    res.json(response);
  } catch (err) {
    const message = (err as Error).message ?? '';
    console.error('Transcript fetch error:', message);
    if (message.includes('disabled') || message.includes('not found')) {
      return res.status(404).json({ error: 'No subtitles available for this video' });
    }
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

export default router;
