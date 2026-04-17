import { useTranslation } from 'react-i18next';
import { Clock3 } from 'lucide-react';
import { Badge } from '../Common/Badge.jsx';

export const TIME_BUCKETS = [
  { id: 'all', min: 0, max: Number.POSITIVE_INFINITY },
  { id: '0-5', min: 0, max: 5 * 60 },
  { id: '5-15', min: 5 * 60, max: 15 * 60 },
  { id: '15-30', min: 15 * 60, max: 30 * 60 },
  { id: '30+', min: 30 * 60, max: Number.POSITIVE_INFINITY },
];

export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function formatTimeRange(startTime, endTime) {
  if (!Number.isFinite(startTime)) return null;
  if (!Number.isFinite(endTime) || endTime <= startTime) return formatTime(startTime);
  return `${formatTime(startTime)}-${formatTime(endTime)}`;
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return [start.getTime(), end.getTime()];
}

export function isDueToday(progress) {
  if (!progress?.nextReview) return false;
  const [start, end] = getTodayRange();
  return progress.nextReview >= start && progress.nextReview <= end;
}

export function matchesTimeBucket(startTime, bucketId) {
  if (bucketId === 'all') return true;
  if (!Number.isFinite(startTime)) return false;
  const bucket = TIME_BUCKETS.find((option) => option.id === bucketId);
  if (!bucket) return true;
  if (bucket.id === '30+') return startTime >= bucket.min;
  return startTime >= bucket.min && startTime < bucket.max;
}

export function getTimeBucketLabel(t, bucketId) {
  return t(`practice.timeBucket.${bucketId}`);
}

export function SelectionModeCard({ icon: Icon, title, description, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${
        active
          ? 'border-primary-300 bg-primary-50 shadow-[0_12px_32px_-24px_rgba(37,99,235,0.85)]'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
          active ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-500'
        }`}>
          <Icon size={18} />
        </span>
        <div>
          <p className="font-semibold text-stone-900">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-stone-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

export function FilterPill({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? 'border-primary-200 bg-primary-50 text-primary-700'
          : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

export function TimeChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? 'border-primary-200 bg-primary-50 text-primary-700'
          : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
      }`}
    >
      {label}
    </button>
  );
}

export function PassagePickerCard({ passage, selected, onToggle }) {
  const { t } = useTranslation();
  const preview = passage.items
    .map((item) => item.sentence?.text || item.exercise?.blanked || '')
    .join(' ')
    .trim();

  return (
    <button
      type="button"
      onClick={() => onToggle(passage.id)}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected
          ? 'border-primary-300 bg-primary-50/70 shadow-[0_14px_30px_-26px_rgba(37,99,235,0.9)]'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={t('practice.passage')} type="daily" />
            <span className="text-sm font-medium text-stone-700">
              {t('practice.relatedSentences', { count: passage.items.length })}
            </span>
            <span className="text-sm text-stone-500">
              {t('practice.blankCount', { count: passage.blankCount })}
            </span>
          </div>
          <p className="mt-3 line-clamp-3 text-[0.97rem] leading-relaxed text-stone-700">
            {preview || t('practice.noPreview')}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full border text-xs font-semibold ${
            selected
              ? 'border-primary-300 bg-primary-600 text-white'
              : 'border-stone-200 bg-white text-stone-500'
          }`}>
            {selected ? '✓' : ''}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-stone-500">
            <Clock3 size={12} />
            {formatTimeRange(passage.startTime, passage.endTime)}
          </span>
        </div>
      </div>
    </button>
  );
}

export function DrillPickerCard({ drill, selected, onToggle }) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => onToggle(drill.selectionId)}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected
          ? 'border-primary-300 bg-primary-50/70 shadow-[0_14px_30px_-26px_rgba(37,99,235,0.9)]'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={t(`practice.${drill.drillType}`)} type={drill.difficulty} />
            <Badge label={t(`practice.${drill.difficulty}`)} type={drill.difficulty} />
          </div>
          <p className="mt-3 text-[0.97rem] font-medium leading-relaxed text-stone-800">
            {drill.prompt}
          </p>
          {drill.originalSentence && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
              {drill.originalSentence}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full border text-xs font-semibold ${
            selected
              ? 'border-primary-300 bg-primary-600 text-white'
              : 'border-stone-200 bg-white text-stone-500'
          }`}>
            {selected ? '✓' : ''}
          </span>
          {Number.isFinite(drill.startTime) && (
            <span className="inline-flex items-center gap-1 text-xs text-stone-500">
              <Clock3 size={12} />
              {formatTime(drill.startTime)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
