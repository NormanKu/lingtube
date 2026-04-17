import { useTranslation } from 'react-i18next';
import { CalendarClock, CheckSquare, ChevronLeft, Clock3, Search, Target } from 'lucide-react';
import { Button } from '../Common/Button.jsx';
import {
  DrillPickerCard,
  FilterPill,
  getTimeBucketLabel,
  PassagePickerCard,
  TIME_BUCKETS,
  TimeChip,
} from './PracticeSessionShared.jsx';

export function PracticeItemPicker({
  mode,
  filters,
  visibleItems,
  passages,
  drillOptions,
  customSelections,
  activeSelectedCount,
  activeTotalCount,
  onBack,
  onBegin,
  onSetFilter,
  onAddVisibleSelection,
  onReplaceSelection,
  onQuickSelectTimeBucket,
  onToggleSelection,
}) {
  const { t } = useTranslation();
  const targetMode = mode;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft size={14} />
          {t('practice.back')}
        </Button>

        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            {t('practice.manualSelection')}
          </p>
          <p className="text-sm text-stone-500">
            {mode === 'cloze' ? t('practice.pickPassagesDesc') : t('practice.pickDrillsDesc')}
          </p>
        </div>
      </div>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">
              {mode === 'cloze' ? t('practice.choosePassages') : t('practice.chooseDrills')}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {t('practice.selectedCount', {
                count: activeSelectedCount,
                total: activeTotalCount,
              })}
            </p>
          </div>

          <Button onClick={onBegin} disabled={activeSelectedCount === 0}>
            <CheckSquare size={15} />
            {t('practice.startSelected')}
          </Button>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-stone-50/75 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <label className="relative block">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(event) => onSetFilter(targetMode, 'search', event.target.value)}
                placeholder={t('practice.searchInItems')}
                className="w-full rounded-2xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-700 outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <FilterPill
                active={filters.onlyUnfamiliar}
                icon={Target}
                label={t('practice.onlyUnfamiliar')}
                onClick={() => onSetFilter(targetMode, 'onlyUnfamiliar', !filters.onlyUnfamiliar)}
              />
              <FilterPill
                active={filters.onlyDueToday}
                icon={CalendarClock}
                label={t('practice.onlyDueToday')}
                onClick={() => onSetFilter(targetMode, 'onlyDueToday', !filters.onlyDueToday)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
              <Clock3 size={12} />
              {t('practice.timeRange')}
            </span>
            {TIME_BUCKETS.map((bucket) => (
              <TimeChip
                key={bucket.id}
                active={filters.timeBucket === bucket.id}
                label={getTimeBucketLabel(t, bucket.id)}
                onClick={() => onSetFilter(targetMode, 'timeBucket', bucket.id)}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onAddVisibleSelection(targetMode)}>
              <CheckSquare size={14} />
              {t('practice.selectVisible')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReplaceSelection(
                targetMode,
                (targetMode === 'cloze' ? passages : drillOptions).map((item) => (
                  targetMode === 'cloze' ? item.id : item.selectionId
                ))
              )}
            >
              {t('practice.selectAll')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onReplaceSelection(targetMode, [])}>
              {t('practice.clear')}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
              {t('practice.quickPickByTime')}
            </span>
            {TIME_BUCKETS.filter((bucket) => bucket.id !== 'all').map((bucket) => (
              <button
                key={bucket.id}
                type="button"
                onClick={() => onQuickSelectTimeBucket(targetMode, bucket.id)}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-800"
              >
                + {getTimeBucketLabel(t, bucket.id)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {visibleItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center text-sm text-stone-500">
              {t('practice.noItemsMatch')}
            </div>
          )}

          {mode === 'cloze' && visibleItems.map((passage) => (
            <PassagePickerCard
              key={passage.id}
              passage={passage}
              selected={customSelections.cloze.includes(passage.id)}
              onToggle={(id) => onToggleSelection('cloze', id)}
            />
          ))}

          {mode === 'fsi' && visibleItems.map((drill) => (
            <DrillPickerCard
              key={drill.selectionId}
              drill={drill}
              selected={customSelections.fsi.includes(drill.selectionId)}
              onToggle={(id) => onToggleSelection('fsi', id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
