import { Router, type Request, type Response } from 'express';
import { extractKeySentences, generateClozeTests, generateFSIDrills } from '../services/analysis.js';
import { getAIRequestContext } from './aiConfig.js';
import {
  keySentencesRequestSchema,
  clozeRequestSchema,
  fsiRequestSchema,
} from '../schemas.js';
import { sanitizeMessage } from '../utils/sanitize.js';

const router = Router();

router.post('/key-sentences', async (req: Request, res: Response) => {
  const parsed = keySentencesRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', issues: parsed.error.flatten() });
  }
  try {
    const { transcript, targetLang } = parsed.data;
    const context = getAIRequestContext(req);
    if (context.keyMode === 'personal' && !context.apiKey) {
      return res.status(400).json({ error: 'Personal API key is required' });
    }
    const sentences = await extractKeySentences(transcript, targetLang, context);
    res.json({ sentences });
  } catch (err) {
    console.error('Key sentences error:', sanitizeMessage(err));
    res.status(500).json({ error: 'Failed to extract key sentences' });
  }
});

router.post('/cloze', async (req: Request, res: Response) => {
  const parsed = clozeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', issues: parsed.error.flatten() });
  }
  try {
    const { sentences } = parsed.data;
    const context = getAIRequestContext(req);
    if (context.keyMode === 'personal' && !context.apiKey) {
      return res.status(400).json({ error: 'Personal API key is required' });
    }
    const exercises = await generateClozeTests(sentences, context);
    res.json({ exercises });
  } catch (err) {
    console.error('Cloze generation error:', sanitizeMessage(err));
    res.status(500).json({ error: 'Failed to generate cloze tests' });
  }
});

router.post('/fsi', async (req: Request, res: Response) => {
  const parsed = fsiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', issues: parsed.error.flatten() });
  }
  try {
    const { sentences, difficulty, drillTypes } = parsed.data;
    const context = getAIRequestContext(req);
    if (context.keyMode === 'personal' && !context.apiKey) {
      return res.status(400).json({ error: 'Personal API key is required' });
    }
    const drills = await generateFSIDrills(sentences, difficulty, drillTypes, context);
    res.json({ drills });
  } catch (err) {
    console.error('FSI drills error:', sanitizeMessage(err));
    res.status(500).json({ error: 'Failed to generate FSI drills' });
  }
});

export default router;
