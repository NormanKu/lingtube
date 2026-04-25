import type { Request, Response, NextFunction } from 'express';

/**
 * Defensive caps for AI cost control.
 *
 * Token cap is a request-level guard so a single malicious payload can't
 * incinerate the budget. Daily IP budget is a per-key counter that resets
 * each UTC day. Both live in process memory — fine for a single Vercel
 * function instance, but each cold-start gets a fresh map. For real
 * production scale, swap the daily counter for Upstash/Redis.
 */

// ~4 chars per token is the OpenAI/Anthropic rule of thumb. We measure the
// concatenated user-visible payload, not just the prompt template, since
// large transcripts/sentences arrays are what blow the budget.
const CHARS_PER_TOKEN = 4;

const MAX_TOKENS_PER_REQUEST = Number(process.env.AI_MAX_TOKENS_PER_REQUEST ?? 80_000);
const MAX_AI_CALLS_PER_DAY = Number(process.env.AI_MAX_CALLS_PER_DAY ?? 50);

interface DailyBucket {
  day: string;
  count: number;
}

const dailyBuckets = new Map<string, DailyBucket>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function pickKey(req: Request): string {
  // express's req.ip already honors trust-proxy. When a personal API key
  // is supplied we treat that key as the identity instead of IP, so a
  // shared corporate IP doesn't punish individual users.
  const personalKey = req.header('x-lingtube-api-key');
  if (personalKey) return `key:${personalKey.slice(0, 12)}`;
  return `ip:${req.ip || 'unknown'}`;
}

export function estimateTokens(payload: unknown): number {
  if (payload == null) return 0;
  if (typeof payload === 'string') return Math.ceil(payload.length / CHARS_PER_TOKEN);
  return Math.ceil(JSON.stringify(payload).length / CHARS_PER_TOKEN);
}

export function tokenCapMiddleware(req: Request, res: Response, next: NextFunction) {
  const tokens = estimateTokens(req.body);
  if (tokens > MAX_TOKENS_PER_REQUEST) {
    return res.status(413).json({
      error: 'Request payload exceeds token budget',
      estimatedTokens: tokens,
      limit: MAX_TOKENS_PER_REQUEST,
    });
  }
  next();
}

export function dailyBudgetMiddleware(req: Request, res: Response, next: NextFunction) {
  // Server-key callers share a single budget; personal-key callers get their
  // own. This keeps the server-side OpenAI/Anthropic spend bounded.
  const key = pickKey(req);
  const today = todayKey();
  const bucket = dailyBuckets.get(key);

  if (!bucket || bucket.day !== today) {
    dailyBuckets.set(key, { day: today, count: 1 });
    return next();
  }

  if (bucket.count >= MAX_AI_CALLS_PER_DAY) {
    return res.status(429).json({
      error: 'Daily AI request budget exceeded',
      limit: MAX_AI_CALLS_PER_DAY,
      resetAt: `${today}T24:00:00Z`,
    });
  }

  bucket.count += 1;
  next();
}
