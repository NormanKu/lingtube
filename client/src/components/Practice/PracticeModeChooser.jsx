import { useTranslation } from 'react-i18next';
import { Compass, ListChecks, Sparkles, Target } from 'lucide-react';
import { SelectionModeCard } from './PracticeSessionShared.jsx';

export function PracticeModeChooser({
  selectionMode,
  onSelectionModeChange,
  onPracticeModeStart,
  passageCount,
  drillCount,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            {t('practice.setBuilder')}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
            {t('practice.chooseSet')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">
            {t('practice.chooseSetDesc')}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SelectionModeCard
            icon={Sparkles}
            title={t('practice.smartPicks')}
            description={t('practice.smartPicksDesc')}
            active={selectionMode === 'smart'}
            onClick={() => onSelectionModeChange('smart')}
          />
          <SelectionModeCard
            icon={ListChecks}
            title={t('practice.allItems')}
            description={t('practice.allItemsDesc')}
            active={selectionMode === 'all'}
            onClick={() => onSelectionModeChange('all')}
          />
          <SelectionModeCard
            icon={Compass}
            title={t('practice.pickItems')}
            description={t('practice.pickItemsDesc')}
            active={selectionMode === 'custom'}
            onClick={() => onSelectionModeChange('custom')}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-gradient-to-br from-stone-50 via-white to-amber-50/50 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            {t('practice.startPractice')}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-900">
            {t('practice.choosePractice')}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            {t('practice.choosePracticeDesc')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            disabled={!passageCount}
            onClick={() => onPracticeModeStart('cloze')}
            className="rounded-3xl border border-stone-200 bg-white p-5 text-left transition-all hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white">
                <ListChecks size={20} />
              </span>
              <div>
                <p className="font-semibold text-stone-900">{t('practice.passage')}</p>
                <p className="text-sm text-stone-500">{t('practice.passageCount', { count: passageCount })}</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={!drillCount}
            onClick={() => onPracticeModeStart('fsi')}
            className="rounded-3xl border border-stone-200 bg-white p-5 text-left transition-all hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
                <Target size={20} />
              </span>
              <div>
                <p className="font-semibold text-stone-900">{t('practice.fsi')}</p>
                <p className="text-sm text-stone-500">{t('practice.allDrillSet', { count: drillCount })}</p>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
