// Simplified SM-2 spaced repetition algorithm
export function calculateNextReview(item, quality) {
  // quality: 0-5 (0=complete failure, 5=perfect)
  let { easeFactor = 2.5, interval = 0, repetitions = 0 } = item;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect - reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor (minimum 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const now = Date.now();
  const nextReview = now + interval * 24 * 60 * 60 * 1000; // days to ms

  return {
    easeFactor,
    interval,
    repetitions,
    lastReviewed: now,
    nextReview,
  };
}

export function getDueItems(allProgress) {
  const now = Date.now();
  const due = [];

  for (const [videoId, sentences] of Object.entries(allProgress)) {
    for (const [sentenceId, progress] of Object.entries(sentences)) {
      if (!progress.familiar && progress.nextReview && progress.nextReview <= now) {
        due.push({ videoId, sentenceId, ...progress });
      }
    }
  }

  return due.sort((a, b) => a.nextReview - b.nextReview);
}
