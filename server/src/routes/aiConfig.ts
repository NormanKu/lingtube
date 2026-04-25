import { Router, type Request, type Response } from 'express';
import { createAIProvider, type AIRequestContext } from '../services/ai/index.js';
import { getProviderCatalog } from '../services/ai/catalog.js';
import { aiValidationRequestSchema } from '../schemas.js';
import { sanitizeMessage } from '../utils/sanitize.js';

const router = Router();

function getAIRequestContext(req: Request): AIRequestContext {
  const apiKeyHeader = req.header('x-lingtube-api-key');
  const apiKey = typeof apiKeyHeader === 'string' ? apiKeyHeader.trim() : undefined;
  const body = (req.body || {}) as Record<string, unknown>;

  return {
    provider: typeof body.provider === 'string' ? body.provider : undefined,
    model: typeof body.model === 'string' ? body.model : undefined,
    keyMode: body.keyMode === 'personal' || body.keyMode === 'server' ? body.keyMode : undefined,
    apiKey,
  };
}

router.get('/providers', (_req: Request, res: Response) => {
  res.json(getProviderCatalog());
});

router.post('/validate', async (req: Request, res: Response) => {
  const parsed = aiValidationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: 'Invalid request' });
  }
  const context = getAIRequestContext(req);

  if (context.keyMode === 'personal' && !context.apiKey) {
    return res.status(400).json({ ok: false, message: 'Personal API key is required' });
  }

  try {
    const ai = createAIProvider(context);
    await ai.validateConnection();
    res.json({ ok: true, message: 'Connection validated successfully' });
  } catch (err) {
    const safe = sanitizeMessage(err) || 'Validation failed';
    console.error('AI validation error:', safe);
    res.status(400).json({ ok: false, message: safe });
  }
});

export { getAIRequestContext };
export default router;
