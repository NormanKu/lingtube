import { useCallback } from 'react';
import type { DueReviewItem } from 'lingtube-shared';
import { learningStore } from '../stores/learningStore';
import { calculateNextReview, getDueItems } from '../utils/srs';
import type { LearningProgressMap } from '../types/app';

export function useLearning() {
  const markFamiliar = useCallback((videoId: string, sentenceId: string) => {
    learningStore.markFamiliar(videoId, sentenceId);
  }, []);

  const markUnfamiliar = useCallback((videoId: string, sentenceId: string) => {
    learningStore.markUnfamiliar(videoId, sentenceId);
  }, []);

  const recordPractice = useCallback((videoId: string, sentenceId: string, quality: number) => {
    const current = learningStore.getSentenceProgress(videoId, sentenceId);
    const updates = calculateNextReview(current, quality) as Partial<typeof current>;
    const isCorrect = quality >= 3;
    learningStore.updateSentence(videoId, sentenceId, {
      ...updates,
      correctCount: current.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: current.incorrectCount + (isCorrect ? 0 : 1),
    });
  }, []);

  const getProgress = useCallback((videoId: string) => {
    return learningStore.get(videoId) as LearningProgressMap;
  }, []);

  const getDueReviews = useCallback(() => {
    const allProgress = learningStore.getAllProgress();
    return getDueItems(allProgress) as DueReviewItem[];
  }, []);

  const getSentenceProgress = useCallback((videoId: string, sentenceId: string) => {
    return learningStore.getSentenceProgress(videoId, sentenceId);
  }, []);

  return {
    markFamiliar,
    markUnfamiliar,
    recordPractice,
    getProgress,
    getDueReviews,
    getSentenceProgress,
  };
}
