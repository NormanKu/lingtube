declare module 'youtube-transcript/dist/youtube-transcript.esm.js' {
  interface TranscriptSegment {
    text: string;
    offset: number;
    duration: number;
    lang: string;
  }

  export class YoutubeTranscript {
    static fetchTranscript(
      videoIdOrUrl: string,
      options?: { lang?: string }
    ): Promise<TranscriptSegment[]>;
  }

  export function fetchTranscript(
    videoIdOrUrl: string,
    options?: { lang?: string }
  ): Promise<TranscriptSegment[]>;
}
