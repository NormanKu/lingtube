/**
 * Strip secrets from text before logging or returning to clients.
 *
 * Covers OpenAI/Anthropic key shapes and common Authorization headers.
 * Match list is intentionally broad: when in doubt, redact.
 */

const PATTERNS: Array<RegExp> = [
  /sk-(?:proj-|ant-)?[A-Za-z0-9_\-]{16,}/g,
  /\bAuthorization:\s*Bearer\s+[A-Za-z0-9._\-]+/gi,
  /\bBearer\s+[A-Za-z0-9._\-]{16,}/g,
  /x-api-key:\s*[A-Za-z0-9._\-]+/gi,
];

export function sanitizeMessage(input: unknown): string {
  const raw = typeof input === 'string' ? input : (input as Error)?.message ?? String(input ?? '');
  return PATTERNS.reduce((acc, re) => acc.replace(re, '***'), raw);
}
