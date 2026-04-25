import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { groupClozePassages } from '../../utils/groupClozePassages';
import { selectSmartDrills, selectSmartPassages } from '../../utils/selectPracticeItems';
import { PracticeModeChooser } from './PracticeModeChooser.jsx';
import { PracticeItemPicker } from './PracticeItemPicker.jsx';
import { ClozePracticeView, DrillPracticeView } from './PracticeRunViews';
import { isDueToday, matchesTimeBucket } from './PracticeSessionShared.jsx';

export function PracticeSession({
  sentences: sentencesProp,
  clozeExercises: clozeExercisesProp,
  fsiDrills: fsiDrillsProp,
  learningProgress: learningProgressProp,
  currentTime,
  onResult,
  onPlayAudio,
  onComplete,
}) {
  const { t } = useTranslation();
  // Normalize props defensively (handle null/undefined/non-array)
  const sentences = Array.isArray(sentencesProp) ? sentencesProp : [];
  const clozeExercises = Array.isArray(clozeExercisesProp) ? clozeExercisesProp : [];
  const fsiDrills = Array.isArray(fsiDrillsProp) ? fsiDrillsProp : [];
  const learningProgress = learningProgressProp && typeof learningProgressProp === 'object'
    ? learningProgressProp
    : {};
  const [selectionMode, setSelectionMode] = useState('smart');
  const [mode, setMode] = useState(null);
  const [isPickingItems, setIsPickingItems] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [customSelections, setCustomSelections] = useState({ cloze: [], fsi: [] });
  const [pickerFilters, setPickerFilters] = useState({
    cloze: { search: '', onlyUnfamiliar: false, onlyDueToday: false, timeBucket: 'all' },
    fsi: { search: '', onlyUnfamiliar: false, onlyDueToday: false, timeBucket: 'all' },
  });

  const sentenceMap = useMemo(
    () => new Map(sentences.map((sentence) => [sentence.id, sentence])),
    [sentences]
  );

  const passages = useMemo(
    () => groupClozePassages(clozeExercises, sentences),
    [clozeExercises, sentences]
  );

  const smartPassages = useMemo(
    () => selectSmartPassages(passages, learningProgress),
    [passages, learningProgress]
  );

  const drillOptions = useMemo(
    () => fsiDrills.map((drill, index) => {
      const sentence = sentenceMap.get(drill.sentenceId) || null;
      return {
        ...drill,
        selectionId: `${drill.sentenceId}-${drill.drillType}-${index}`,
        sentence,
        startTime: sentence?.startTime ?? Number.POSITIVE_INFINITY,
      };
    }),
    [fsiDrills, sentenceMap]
  );

  const smartDrills = useMemo(
    () => selectSmartDrills(drillOptions, learningProgress),
    [drillOptions, learningProgress]
  );

  const activePassages = useMemo(() => {
    if (selectionMode === 'smart') return smartPassages;
    if (selectionMode === 'all') return passages;
    const selectedIds = new Set(customSelections.cloze);
    return passages.filter((passage) => selectedIds.has(passage.id));
  }, [customSelections.cloze, passages, selectionMode, smartPassages]);

  const activeDrills = useMemo(() => {
    if (selectionMode === 'smart') return smartDrills;
    if (selectionMode === 'all') return drillOptions;
    const selectedIds = new Set(customSelections.fsi);
    return drillOptions.filter((drill) => selectedIds.has(drill.selectionId));
  }, [customSelections.fsi, drillOptions, selectionMode, smartDrills]);

  const currentPassage = mode === 'cloze' ? activePassages[currentIndex] : null;
  const filters = mode ? pickerFilters[mode] : pickerFilters.cloze;

  const filteredPassages = useMemo(() => {
    const query = pickerFilters.cloze.search.trim().toLowerCase();
    return passages.filter((passage) => {
      const progressList = passage.sentenceIds.map((sentenceId) => learningProgress[sentenceId] || {});
      const text = passage.items
        .map((item) => [
          item.sentence?.text,
          item.sentence?.translation,
          item.exercise?.blanked,
        ].filter(Boolean).join(' '))
        .join(' ')
        .toLowerCase();

      if (query && !text.includes(query)) return false;
      if (pickerFilters.cloze.onlyUnfamiliar && !progressList.some((progress) => progress.familiar !== true)) {
        return false;
      }
      if (pickerFilters.cloze.onlyDueToday && !progressList.some((progress) => isDueToday(progress))) {
        return false;
      }
      if (!matchesTimeBucket(passage.startTime, pickerFilters.cloze.timeBucket)) return false;
      return true;
    });
  }, [learningProgress, passages, pickerFilters.cloze]);

  const filteredDrills = useMemo(() => {
    const query = pickerFilters.fsi.search.trim().toLowerCase();
    return drillOptions.filter((drill) => {
      const progress = learningProgress[drill.sentenceId] || {};
      const text = [
        drill.prompt,
        drill.originalSentence,
        drill.expectedAnswer,
        drill.explanation,
      ].filter(Boolean).join(' ').toLowerCase();

      if (query && !text.includes(query)) return false;
      if (pickerFilters.fsi.onlyUnfamiliar && progress.familiar === true) return false;
      if (pickerFilters.fsi.onlyDueToday && !isDueToday(progress)) return false;
      if (!matchesTimeBucket(drill.startTime, pickerFilters.fsi.timeBucket)) return false;
      return true;
    });
  }, [drillOptions, learningProgress, pickerFilters.fsi]);

  const activeFilteredItems = mode === 'cloze' ? filteredPassages : filteredDrills;
  const activeSelectedCount = mode === 'cloze'
    ? customSelections.cloze.length
    : customSelections.fsi.length;
  const activeTotalCount = mode === 'cloze' ? passages.length : drillOptions.length;

  const setPickerFilter = (targetMode, key, value) => {
    setPickerFilters((current) => ({
      ...current,
      [targetMode]: {
        ...current[targetMode],
        [key]: value,
      },
    }));
  };

  const resetRunState = () => {
    setCurrentIndex(0);
    setScore(0);
  };

  const handleSelectionModeChange = (nextMode) => {
    setSelectionMode(nextMode);
    setMode(null);
    setIsPickingItems(false);
    resetRunState();
  };

  const handlePracticeModeStart = (nextMode) => {
    setMode(nextMode);
    resetRunState();
    setIsPickingItems(selectionMode === 'custom');
  };

  const handleBackToChooser = () => {
    setIsPickingItems(false);
    setMode(null);
    resetRunState();
  };

  const toggleSelection = (targetMode, id) => {
    setCustomSelections((current) => {
      const list = current[targetMode];
      const nextList = list.includes(id)
        ? list.filter((itemId) => itemId !== id)
        : [...list, id];

      return {
        ...current,
        [targetMode]: nextList,
      };
    });
  };

  const replaceSelection = (targetMode, ids) => {
    setCustomSelections((current) => ({
      ...current,
      [targetMode]: ids,
    }));
  };

  const addVisibleSelection = (targetMode) => {
    const visibleIds = (targetMode === 'cloze' ? filteredPassages : filteredDrills)
      .map((item) => (targetMode === 'cloze' ? item.id : item.selectionId));

    setCustomSelections((current) => ({
      ...current,
      [targetMode]: Array.from(new Set([...current[targetMode], ...visibleIds])),
    }));
  };

  const quickSelectTimeBucket = (targetMode, bucketId) => {
    const sourceItems = targetMode === 'cloze' ? passages : drillOptions;
    const matchingIds = sourceItems
      .filter((item) => matchesTimeBucket(item.startTime, bucketId))
      .map((item) => (targetMode === 'cloze' ? item.id : item.selectionId));

    setCustomSelections((current) => ({
      ...current,
      [targetMode]: Array.from(new Set([...current[targetMode], ...matchingIds])),
    }));
  };

  const beginCustomRun = () => {
    if (
      (mode === 'cloze' && customSelections.cloze.length === 0) ||
      (mode === 'fsi' && customSelections.fsi.length === 0)
    ) {
      return;
    }

    setIsPickingItems(false);
    resetRunState();
  };

  const handlePassageResult = (quality) => {
    if (!currentPassage) return;
    currentPassage.sentenceIds.forEach((sentenceId) => onResult?.(sentenceId, quality));
    if (quality >= 3) {
      setScore((current) => current + 1);
    }
  };

  const handlePassageNext = () => {
    if (currentIndex < activePassages.length - 1) {
      setCurrentIndex((current) => current + 1);
    } else {
      setCurrentIndex(activePassages.length);
    }
  };

  const restartCurrentSet = () => {
    resetRunState();
  };

  const currentSetLabel = selectionMode === 'smart'
    ? t('practice.smartPicks')
    : selectionMode === 'all'
      ? t('practice.allItems')
      : t('practice.pickItems');

  if (!mode) {
    return (
      <PracticeModeChooser
        selectionMode={selectionMode}
        onSelectionModeChange={handleSelectionModeChange}
        onPracticeModeStart={handlePracticeModeStart}
        passageCount={passages.length}
        drillCount={drillOptions.length}
      />
    );
  }

  if (isPickingItems) {
    return (
      <PracticeItemPicker
        mode={mode}
        filters={filters}
        visibleItems={activeFilteredItems}
        passages={passages}
        drillOptions={drillOptions}
        customSelections={customSelections}
        activeSelectedCount={activeSelectedCount}
        activeTotalCount={activeTotalCount}
        onBack={handleBackToChooser}
        onBegin={beginCustomRun}
        onSetFilter={setPickerFilter}
        onAddVisibleSelection={addVisibleSelection}
        onReplaceSelection={replaceSelection}
        onQuickSelectTimeBucket={quickSelectTimeBucket}
        onToggleSelection={toggleSelection}
      />
    );
  }

  if (mode === 'cloze') {
    return (
      <ClozePracticeView
        activePassages={activePassages}
        currentIndex={currentIndex}
        currentTime={currentTime}
        currentSetLabel={currentSetLabel}
        selectionMode={selectionMode}
        score={score}
        onBack={handleBackToChooser}
        onRestart={restartCurrentSet}
        onComplete={onComplete}
        onPassageResult={handlePassageResult}
        onPassageNext={handlePassageNext}
        onPlayAudio={onPlayAudio}
      />
    );
  }

  return (
    <DrillPracticeView
      activeDrills={activeDrills}
      currentSetLabel={currentSetLabel}
      selectionMode={selectionMode}
      onBack={handleBackToChooser}
      onResult={onResult}
      onPlayAudio={onPlayAudio}
    />
  );
}
