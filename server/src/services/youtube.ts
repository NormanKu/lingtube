import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';
import type { TranscriptSegment } from 'lingtube-shared';

const URL_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

const TRANSCRIPT_TIMEOUT_MS = 10_000;
const TRANSCRIPT_RETRIES = 2;
const TITLE_TIMEOUT_MS = 5_000;

export function extractVideoId(url: string): string | null {
  for (const pattern of URL_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function timeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function withRetry<T>(fn: () => Promise<T>, retries: number, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Don't retry input errors that won't get better — caller decides via message.
      const message = (err as Error).message ?? '';
      if (/disabled|not found|unavailable/i.test(message)) throw err;
      if (attempt < retries) {
        const backoff = 500 * 2 ** attempt;
        console.warn(`${label} attempt ${attempt + 1} failed, retrying in ${backoff}ms`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastErr;
}

export async function fetchVideoTitle(videoId: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TITLE_TIMEOUT_MS);
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(timer);

    if (!response.ok) return undefined;

    const data = (await response.json()) as { title?: string };
    return data.title || undefined;
  } catch {
    return undefined;
  }
}

interface RawSegment {
  text: string;
  offset: number;
  duration: number;
}

export async function fetchTranscript(
  videoId: string,
  lang = 'en'
): Promise<TranscriptSegment[]> {
  const segments: RawSegment[] = await withRetry(
    () =>
      timeout(
        YoutubeTranscript.fetchTranscript(videoId, { lang }),
        TRANSCRIPT_TIMEOUT_MS,
        'fetchTranscript'
      ),
    TRANSCRIPT_RETRIES,
    'fetchTranscript'
  );
  return segments.map((seg) => ({
    text: seg.text,
    start: Math.round((seg.offset / 1000) * 100) / 100,
    duration: Math.round((seg.duration / 1000) * 100) / 100,
  }));
}
