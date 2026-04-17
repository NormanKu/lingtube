import { useTranslation } from 'react-i18next';
import { AlertTriangle, Bookmark, BookmarkCheck, Play } from 'lucide-react';
import { Badge } from '../Common/Badge.jsx';
import type { AlignedSentence } from '../../types/app';

const APPROXIMATE_SEEK_LEAD = 1.5;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type SentenceCardProps = {
  sentence: AlignedSentence;
  isFamiliar?: boolean;
  onSeek: (time: number) => void;
  onToggleFamiliar: (sentenceId: string) => void;
  isActive: boolean;
};

export function SentenceCard({
  sentence,
  isFamiliar = false,
  onSeek,
  onToggleFamiliar,
  isActive,
}: SentenceCardProps) {
  const { t } = useTranslation();
  const timeLabel = sentence.timingApproximate
    ? `~${formatTime(sentence.startTime)}`
    : formatTime(sentence.startTime);
  const seekTime = sentence.timingApproximate
    ? Math.max(0, sentence.startTime - APPROXIMATE_SEEK_LEAD)
    : sentence.startTime;
  const timingTitle = sentence.timingApproximate
    ? t('video.approximateTimingHint')
    : t('video.exactTimingHint');

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isActive ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-relaxed text-gray-900">
          {sentence.original}
        </p>
        <button
          type="button"
          onClick={() => onToggleFamiliar(sentence.id)}
          className={`shrink-0 rounded p-1 transition-colors ${
            isFamiliar ? 'text-accent-500 hover:text-accent-600' : 'text-gray-300 hover:text-gray-500'
          }`}
          title={isFamiliar ? t('video.markUnfamiliar') : t('video.markFamiliar')}
        >
          {isFamiliar ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-gray-500">{sentence.translation}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSeek(seekTime)}
          title={timingTitle}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs transition-colors ${
            sentence.timingApproximate
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Play size={10} />
          {timeLabel}
        </button>

        {sentence.timingApproximate && (
          <span
            title={timingTitle}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
          >
            <AlertTriangle size={12} />
            {t('video.approximateTime')}
          </span>
        )}

        {sentence.categories?.map((category) => (
          <Badge key={category} label={t(`categories.${category}`)} type={category} />
        ))}

        <Badge label={t(`practice.${sentence.difficulty}`)} type={sentence.difficulty} />
      </div>

      {sentence.notes && (
        <p className="mt-2 text-xs italic text-gray-400">{sentence.notes}</p>
      )}
    </div>
  );
}
