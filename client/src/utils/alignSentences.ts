import type { Sentence, TranscriptSegment } from 'lingtube-shared';
import type { AlignedSentence, TimingConfidence } from '../types/app';

const MAX_WINDOW_SIZE = 8;
const MIN_MATCH_SCORE = 0.72;
const HIGH_MATCH_SCORE = 1;
const LEAD_IN_SECONDS = 0.35;

interface PreparedSegment extends TranscriptSegment {
  normalized: string;
  tokens: string[];
}

interface BestMatch {
  score: number;
  startIndex: number;
  endIndex: number;
  windowSize: number;
}

function roundTime(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeText(text = ''): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTokens(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  if (/\s/.test(normalized)) {
    return normalized.split(' ').filter(Boolean);
  }

  // Languages like Japanese may not use spaces, so fall back to character tokens.
  return Array.from(normalized).filter((char) => char.trim());
}

function getMatchScore(
  sentenceText: string,
  sentenceTokens: string[],
  windowText: string,
  windowTokens: string[]
): number {
  if (!sentenceTokens.length || !windowTokens.length) return 0;

  const sentenceSet = new Set(sentenceTokens);
  const windowSet = new Set(windowTokens);
  let overlap = 0;

  for (const token of sentenceSet) {
    if (windowSet.has(token)) overlap += 1;
  }

  let score = overlap / sentenceSet.size;

  if (windowText.includes(sentenceText)) {
    score += 0.35;
  } else if (sentenceText.includes(windowText)) {
    score += 0.15;
  }

  return score;
}

function getTimingConfidence(score: number, shortSentence: boolean): TimingConfidence {
  const minimumReliableScore = shortSentence ? HIGH_MATCH_SCORE : MIN_MATCH_SCORE;

  if (score >= HIGH_MATCH_SCORE) return 'high';
  if (score >= minimumReliableScore) return 'medium';
  return 'low';
}

export function alignSentencesToSegments(
  sentences: Sentence[] = [],
  segments: TranscriptSegment[] = []
): AlignedSentence[] {
  if (!sentences.length || !segments.length) return sentences as AlignedSentence[];

  const preparedSegments: PreparedSegment[] = segments.map((segment) => ({
    ...segment,
    normalized: normalizeText(segment.text),
    tokens: toTokens(segment.text),
  }));

  let cursor = 0;

  return sentences.map((sentence): AlignedSentence => {
    const sentenceText = normalizeText(sentence.original);
    const sentenceTokens = toTokens(sentence.original);

    if (!sentenceTokens.length) {
      return {
        ...sentence,
        timingApproximate: true,
        timingConfidence: 'low',
        timingScore: 0,
        timingSource: 'ai',
      };
    }

    let bestMatch: BestMatch | null = null;
    const searchStart = Math.max(0, cursor - 2);

    for (let startIndex = searchStart; startIndex < preparedSegments.length; startIndex += 1) {
      let combinedText = '';
      const combinedTokens: string[] = [];

      for (
        let windowSize = 1;
        windowSize <= MAX_WINDOW_SIZE && startIndex + windowSize <= preparedSegments.length;
        windowSize += 1
      ) {
        const segment = preparedSegments[startIndex + windowSize - 1];
        combinedText = combinedText ? `${combinedText} ${segment.normalized}` : segment.normalized;
        combinedTokens.push(...segment.tokens);

        const score = getMatchScore(sentenceText, sentenceTokens, combinedText, combinedTokens);

        if (
          !bestMatch ||
          score > bestMatch.score ||
          (score === bestMatch.score && windowSize < bestMatch.windowSize)
        ) {
          bestMatch = {
            score,
            startIndex,
            endIndex: startIndex + windowSize - 1,
            windowSize,
          };
        }
      }
    }

    const shortSentence = sentenceTokens.length < 4;
    const bestScore = bestMatch?.score || 0;
    const timingConfidence = getTimingConfidence(bestScore, shortSentence);
    const isReliableMatch = bestMatch && timingConfidence !== 'low';

    if (!isReliableMatch || !bestMatch) {
      return {
        ...sentence,
        timingApproximate: true,
        timingConfidence,
        timingScore: roundTime(bestScore),
        timingSource: 'ai',
      };
    }

    cursor = bestMatch.endIndex + 1;

    const startSegment = segments[bestMatch.startIndex];
    const endSegment = segments[bestMatch.endIndex];
    const startTime = Math.max(0, startSegment.start - LEAD_IN_SECONDS);
    const endTime = Math.max(startTime, endSegment.start + endSegment.duration);

    return {
      ...sentence,
      startTime: roundTime(startTime),
      endTime: roundTime(endTime),
      timingApproximate: timingConfidence !== 'high',
      timingConfidence,
      timingScore: roundTime(bestMatch.score),
      timingSource: 'transcript',
      timingSegmentStartIndex: bestMatch.startIndex,
      timingSegmentEndIndex: bestMatch.endIndex,
    };
  });
}
