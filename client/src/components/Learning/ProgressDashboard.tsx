import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { LearningProgressMap, AlignedSentence } from '../../types/app';

type ProgressDashboardProps = {
  sentences: AlignedSentence[];
  learningProgress: LearningProgressMap;
};

type ProgressStats = {
  total: number;
  familiar: number;
  unfamiliar: number;
  practiced: number;
  accuracy: number;
};

export function ProgressDashboard({
  sentences,
  learningProgress,
}: ProgressDashboardProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    if (!sentences?.length) return null as ProgressStats | null;

    let familiar = 0;
    let practiced = 0;
    let totalCorrect = 0;
    let totalAttempts = 0;

    for (const sentence of sentences) {
      const progress = learningProgress?.[sentence.id];
      if (progress?.familiar) familiar++;
      if (progress?.correctCount || progress?.incorrectCount) {
        practiced++;
        totalCorrect += progress.correctCount || 0;
        totalAttempts += (progress.correctCount || 0) + (progress.incorrectCount || 0);
      }
    }

    return {
      total: sentences.length,
      familiar,
      unfamiliar: sentences.length - familiar,
      practiced,
      accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    } satisfies ProgressStats;
  }, [learningProgress, sentences]);

  if (!stats) return null;

  const progressPct = Math.round((stats.familiar / stats.total) * 100);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>{stats.familiar}/{stats.total} mastered</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-accent-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-semibold text-accent-600">{stats.familiar}</p>
          <p className="text-xs text-gray-400">{t('video.familiar')}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-amber-600">{stats.unfamiliar}</p>
          <p className="text-xs text-gray-400">{t('video.unfamiliar')}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-primary-600">{stats.accuracy}%</p>
          <p className="text-xs text-gray-400">Accuracy</p>
        </div>
      </div>
    </div>
  );
}
