import type { SentenceProgress } from 'lingtube-shared';
import { storage } from './storage.js';
import { DEFAULT_SENTENCE_PROGRESS, type AllLearningProgress, type LearningProgressMap } from '../types/app';

export const learningStore = {
  get(videoId: string) {
    return storage.get(`learning:${videoId}`, {}) as LearningProgressMap;
  },

  getSentenceProgress(videoId: string, sentenceId: string): SentenceProgress {
    const data = this.get(videoId);
    return data[sentenceId] ? { ...data[sentenceId] } : { ...DEFAULT_SENTENCE_PROGRESS };
  },

  updateSentence(videoId: string, sentenceId: string, updates: Partial<SentenceProgress>) {
    const data = this.get(videoId);
    data[sentenceId] = { ...this.getSentenceProgress(videoId, sentenceId), ...updates };
    storage.set(`learning:${videoId}`, data);
  },

  markFamiliar(videoId: string, sentenceId: string) {
    this.updateSentence(videoId, sentenceId, { familiar: true });
  },

  markUnfamiliar(videoId: string, sentenceId: string) {
    this.updateSentence(videoId, sentenceId, { familiar: false });
  },

  getAllProgress() {
    const allKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith('lingtube:learning:'))
      .map((key) => key.replace('lingtube:learning:', ''));
    const result = {} as AllLearningProgress;
    for (const videoId of allKeys) {
      result[videoId] = this.get(videoId);
    }
    return result;
  },
};
