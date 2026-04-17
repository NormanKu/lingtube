import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Trophy } from 'lucide-react';
import { Button } from '../components/Common/Button.jsx';
import { useLearning } from '../hooks/useLearning';
import { videoStore } from '../stores/videoStore';
import { ClozeTest } from '../components/Practice/ClozeTest';

type ReviewScore = {
  correct: number;
  total: number;
};

export function ReviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getDueReviews, recordPractice } = useLearning();
  const [reviewing, setReviewing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 } as ReviewScore);

  const dueItems = useMemo(() => getDueReviews(), [getDueReviews, reviewing]);

  const reviewExercises = useMemo(() => {
    return dueItems.map((item: any) => {
      const saved = videoStore.get(item.videoId);
      const sentence = saved?.sentences?.find((entry: any) => entry.id === item.sentenceId);
      const cloze = saved?.clozeExercises?.find((entry: any) => entry.sentenceId === item.sentenceId);
      return { ...item, sentence, cloze };
    }).filter((item: any) => item.cloze);
  }, [dueItems]);

  if (!reviewing) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <RotateCcw size={48} className="mx-auto mb-4 text-primary-400" />
        <h1 className="mb-2 text-2xl font-bold text-gray-800">{t('review.title')}</h1>
        {dueItems.length > 0 ? (
          <>
            <p className="mb-6 text-gray-500">
              {t('review.dueItems', { count: dueItems.length })}
            </p>
            <Button size="lg" onClick={() => setReviewing(true)}>
              {t('review.startReview')}
            </Button>
          </>
        ) : (
          <p className="text-gray-400">{t('review.noDue')}</p>
        )}
      </div>
    );
  }

  if (currentIndex >= reviewExercises.length) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <Trophy size={48} className="mx-auto mb-4 text-accent-500" />
        <h2 className="mb-2 text-xl font-semibold">{t('practice.complete')}</h2>
        <p className="mb-6 text-gray-500">
          {t('practice.score', { correct: score.correct, total: score.total })}
        </p>
        <Button onClick={() => {
          setReviewing(false);
          setCurrentIndex(0);
          setScore({ correct: 0, total: 0 });
          navigate('/review');
        }}
        >
          Done
        </Button>
      </div>
    );
  }

  const current = reviewExercises[currentIndex];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Review {currentIndex + 1} / {reviewExercises.length}
        </span>
        <div className="mx-4 h-2 flex-1 rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary-500 transition-all"
            style={{ width: `${((currentIndex + 1) / reviewExercises.length) * 100}%` }}
          />
        </div>
      </div>

      {current.sentence && (
        <p className="mb-2 text-xs text-gray-400">
          From video: {current.videoId}
        </p>
      )}

      <ClozeTest
        exercise={current.cloze}
        sentence={current.sentence}
        onResult={(quality: number) => {
          recordPractice(current.videoId, current.sentenceId, quality);
          setScore((currentScore: ReviewScore) => ({
            correct: currentScore.correct + (quality >= 3 ? 1 : 0),
            total: currentScore.total + 1,
          }));
        }}
        onNext={() => setCurrentIndex((index: number) => index + 1)}
        onPlayAudio={() => {}}
      />
    </div>
  );
}
