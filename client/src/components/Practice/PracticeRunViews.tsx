import { useTranslation } from 'react-i18next';
import { ChevronLeft, Trophy } from 'lucide-react';
import { Button } from '../Common/Button.jsx';
import { ClozePassageTest } from './ClozePassageTest';
import { FSIDrill } from './FSIDrill';
import type { ClozePracticeViewProps, DrillPracticeViewProps } from './types';

export function ClozePracticeView({
  activePassages,
  currentIndex,
  currentTime,
  currentSetLabel,
  selectionMode,
  score,
  onBack,
  onRestart,
  onComplete,
  onPassageResult,
  onPassageNext,
  onPlayAudio,
}: ClozePracticeViewProps) {
  const { t } = useTranslation();
  const currentPassage = activePassages[currentIndex] || null;

  if (!activePassages.length) {
    // Differentiate between "no items selected (custom mode)" vs "no items match filters"
    const isEmptyCustomSelection = selectionMode === 'custom';
    const title = isEmptyCustomSelection
      ? t('practice.emptyCustomSelection')
      : t('practice.noItemsMatch');
    const description = isEmptyCustomSelection
      ? t('practice.pickPassagesDesc')
      : t('practice.tryDifferentFilters');

    return (
      <div className="rounded-[28px] border border-stone-200 bg-white p-8 text-center shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
        <p className="text-lg font-semibold text-stone-900">{title}</p>
        <p className="mt-2 text-sm text-stone-500">{description}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft size={14} />
            {t('practice.changeSet')}
          </Button>
        </div>
      </div>
    );
  }

  if (currentIndex >= activePassages.length) {
    return (
      <div className="rounded-[28px] border border-stone-200 bg-white p-8 text-center shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Trophy size={28} />
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-900">
          {t('practice.complete')}
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          {t('practice.score', { correct: score, total: activePassages.length })}
        </p>
        <p className="mt-1 text-sm text-stone-400">
          {currentSetLabel} · {t('practice.passageCount', { count: activePassages.length })}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={onRestart}>{t('practice.tryAgain')}</Button>
          <Button variant="ghost" onClick={onBack}>
            {t('practice.changeSet')}
          </Button>
          <Button variant="secondary" onClick={onComplete}>
            {t('practice.backToVideo')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            {currentSetLabel}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-900">
            {t('practice.progress', {
              current: currentIndex + 1,
              total: activePassages.length,
            })}
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t('practice.changeSet')}
        </Button>
      </div>

      <ClozePassageTest
        passage={currentPassage}
        currentTime={currentTime}
        onResult={onPassageResult}
        onNext={onPassageNext}
        onPlayAudio={() => {
          const firstId = currentPassage?.sentenceIds?.[0];
          if (firstId && onPlayAudio) {
            onPlayAudio(firstId);
          }
        }}
      />
    </div>
  );
}

export function DrillPracticeView({
  activeDrills,
  currentSetLabel,
  selectionMode,
  onBack,
  onResult,
  onPlayAudio,
}: DrillPracticeViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            {currentSetLabel}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-900">
            {selectionMode === 'smart'
              ? t('practice.smartDrillSet', { count: activeDrills.length })
              : selectionMode === 'all'
                ? t('practice.allDrillSet', { count: activeDrills.length })
                : t('practice.manualDrillSet', { count: activeDrills.length })}
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t('practice.changeSet')}
        </Button>
      </div>

      <FSIDrill
        drills={activeDrills}
        onResult={onResult}
        onPlayAudio={onPlayAudio}
      />
    </div>
  );
}
