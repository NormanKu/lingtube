const MAX_GAP_SECONDS = 8;
const MAX_PASSAGE_DURATION = 45;
const MAX_SENTENCES_PER_PASSAGE = 4;

export function groupClozePassages(clozeExercises = [], sentences = []) {
  if (!clozeExercises.length) return [];

  const sentenceMap = new Map(sentences.map((sentence) => [sentence.id, sentence]));

  const orderedItems = clozeExercises.map((exercise, index) => {
    const sentence = sentenceMap.get(exercise.sentenceId) || null;

    return {
      exercise,
      sentence,
      originalIndex: index,
      startTime: sentence?.startTime ?? Number.POSITIVE_INFINITY,
      endTime: sentence?.endTime ?? sentence?.startTime ?? Number.POSITIVE_INFINITY,
    };
  });

  orderedItems.sort((a, b) => {
    if (Number.isFinite(a.startTime) && Number.isFinite(b.startTime)) {
      return a.startTime - b.startTime;
    }
    return a.originalIndex - b.originalIndex;
  });

  const passages = [];
  let currentItems = [];

  const pushCurrent = () => {
    if (!currentItems.length) return;

    const startTime = currentItems.find((item) => Number.isFinite(item.startTime))?.startTime ?? null;
    const endTime = [...currentItems].reverse().find((item) => Number.isFinite(item.endTime))?.endTime ?? startTime;

    passages.push({
      id: `passage-${passages.length + 1}`,
      items: currentItems,
      sentenceIds: currentItems.map((item) => item.exercise.sentenceId),
      startTime,
      endTime,
      blankCount: currentItems.reduce((sum, item) => sum + item.exercise.blanks.length, 0),
    });

    currentItems = [];
  };

  for (const item of orderedItems) {
    if (!currentItems.length) {
      currentItems = [item];
      continue;
    }

    const previous = currentItems[currentItems.length - 1];
    const previousEnd = previous.endTime;
    const currentStart = item.startTime;
    const passageStart = currentItems[0].startTime;
    const nextDuration = Number.isFinite(passageStart) && Number.isFinite(item.endTime)
      ? item.endTime - passageStart
      : Number.POSITIVE_INFINITY;
    const gap = Number.isFinite(previousEnd) && Number.isFinite(currentStart)
      ? currentStart - previousEnd
      : Number.POSITIVE_INFINITY;

    const canMerge = (
      gap <= MAX_GAP_SECONDS &&
      nextDuration <= MAX_PASSAGE_DURATION &&
      currentItems.length < MAX_SENTENCES_PER_PASSAGE
    );

    if (canMerge) {
      currentItems.push(item);
    } else {
      pushCurrent();
      currentItems = [item];
    }
  }

  pushCurrent();

  return passages;
}
