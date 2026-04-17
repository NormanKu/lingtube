import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';
import type { TranscriptSegment } from 'lingtube-shared';

const URL_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

export function extractVideoId(url: string): string | null {
  for (const pattern of URL_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchVideoTitle(videoId: string): Promise<string | undefined> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

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
  const segments: RawSegment[] = await YoutubeTranscript.fetchTranscript(videoId, { lang });
  return segments.map((seg) => ({
    text: seg.text,
    start: Math.round((seg.offset / 1000) * 100) / 100,
    duration: Math.round((seg.duration / 1000) * 100) / 100,
  }));
}
