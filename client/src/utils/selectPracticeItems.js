const SMART_PASSAGE_LIMIT = 8;
const SMART_DRILL_LIMIT = 12;

function getSentencePriority(progress = {}) {
  const isDue = Boolean(progress.nextReview && progress.nextReview <= Date.now());
  const attempts = (progress.correctCount || 0) + (progress.incorrectCount || 0);
  const incorrectWeight = (progress.incorrectCount || 0) * 3;
  const unfamiliarWeight = progress.familiar ? 0 : 2;
  const newItemWeight = attempts === 0 ? 4 : 0;
  const dueWeight = isDue ? 5 : 0;
  const lowAccuracyWeight = attempts > 0
    ? Math.round(((progress.incorrectCount || 0) / attempts) * 4)
    : 0;

  return dueWeight + newItemWeight + incorrectWeight + unfamiliarWeight + lowAccuracyWeight;
}

export function selectSmartPassages(passages = [], learningProgress = {}) {
  if (!passages.length) return [];

  return [...passages]
    .map((passage) => {
      const sentenceScores = passage.sentenceIds.map((sentenceId) =>
        getSentencePriority(learningProgress?.[sentenceId] || {})
      );
      const totalScore = sentenceScores.reduce((sum, score) => sum + score, 0);
      const averageScore = totalScore / Math.max(sentenceScores.length, 1);

      return {
        ...passage,
        _priority: totalScore + averageScore,
      };
    })
    .sort((a, b) => {
      if (b._priority !== a._priority) return b._priority - a._priority;
      return (a.startTime || 0) - (b.startTime || 0);
    })
    .slice(0, SMART_PASSAGE_LIMIT)
    .sort((a, b) => (a.startTime || 0) - (b.startTime || 0))
    .map(({ _priority, ...passage }) => passage);
}

export function selectSmartDrills(drills = [], learningProgress = {}) {
  if (!drills.length) return [];

  return [...drills]
    .map((drill, index) => ({
      ...drill,
      _priority: getSentencePriority(learningProgress?.[drill.sentenceId] || {}),
      _index: index,
    }))
    .sort((a, b) => {
      if (b._priority !== a._priority) return b._priority - a._priority;
      return a._index - b._index;
    })
    .slice(0, SMART_DRILL_LIMIT)
    .map(({ _priority, _index, ...drill }) => drill);
}
