import type { SentenceProgress } from 'lingtube-shared';

export interface DueItem extends SentenceProgress {
  videoId: string;
  sentenceId: string;
}

interface NextReview {
  easeFactor: number;
  interval: number;
  repetitions: number;
  lastReviewed: number;
  nextReview: number;
}

// Simplified SM-2 spaced repetition algorithm.
export function calculateNextReview(
  item: Partial<SentenceProgress>,
  quality: number
): NextReview {
  // quality: 0-5 (0=complete failure, 5=perfect)
  let easeFactor = item.easeFactor ?? 2.5;
  let interval = item.interval ?? 0;
  let repetitions = item.repetitions ?? 0;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const now = Date.now();
  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return {
    easeFactor,
    interval,
    repetitions,
    lastReviewed: now,
    nextReview,
  };
}

export function getDueItems(
  allProgress: Record<string, Record<string, SentenceProgress>>
): DueItem[] {
  const now = Date.now();
  const due: DueItem[] = [];

  for (const [videoId, sentences] of Object.entries(allProgress)) {
    for (const [sentenceId, progress] of Object.entries(sentences)) {
      if (!progress.familiar && progress.nextReview && progress.nextReview <= now) {
        due.push({ videoId, sentenceId, ...progress });
      }
    }
  }

  return due.sort((a, b) => (a.nextReview ?? 0) - (b.nextReview ?? 0));
}
