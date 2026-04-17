import { Router, type Request, type Response } from 'express';
import type { KeySentencesRequest, ClozeRequest, FSIDrillsRequest } from 'lingtube-shared';
import { extractKeySentences, generateClozeTests, generateFSIDrills } from '../services/analysis.js';
import { getAIRequestContext } from './aiConfig.js';

const router = Router();

router.post('/key-sentences', async (req: Request<{}, {}, KeySentencesRequest>, res: Response) => {
  try {
    const { transcript, targetLang } = req.body;
    if (!transcript?.length) {
      return res.status(400).json({ error: 'Transcript segments are required' });
    }
    const context = getAIRequestContext(req);
    if (context.keyMode === 'personal' && !context.apiKey) {
      return res.status(400).json({ error: 'Personal API key is required' });
    }
    const sentences = await extractKeySentences(transcript, targetLang, context);
    res.json({ sentences });
  } catch (err) {
    console.error('Key sentences error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to extract key sentences' });
  }
});

router.post('/cloze', async (req: Request<{}, {}, ClozeRequest>, res: Response) => {
  try {
    const { sentences } = req.body;
    if (!sentences?.length) {
      return res.status(400).json({ error: 'Sentences are required' });
    }
    const context = getAIRequestContext(req);
    if (context.keyMode === 'personal' && !context.apiKey) {
      return res.status(400).json({ error: 'Personal API key is required' });
    }
    const exercises = await generateClozeTests(sentences, context);
    res.json({ exercises });
  } catch (err) {
    console.error('Cloze generation error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to generate cloze tests' });
  }
});

router.post('/fsi', async (req: Request<{}, {}, FSIDrillsRequest>, res: Response) => {
  try {
    const { sentences, difficulty, drillTypes } = req.body;
    if (!sentences?.length) {
      return res.status(400).json({ error: 'Sentences are required' });
    }
    const context = getAIRequestContext(req);
    if (context.keyMode === 'personal' && !context.apiKey) {
      return res.status(400).json({ error: 'Personal API key is required' });
    }
    const drills = await generateFSIDrills(sentences, difficulty, drillTypes, context);
    res.json({ drills });
  } catch (err) {
    console.error('FSI drills error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to generate FSI drills' });
  }
});

export default router;
