import { storage } from './storage.js';
import type { HistoryEntry } from '../types/app';

const MAX_HISTORY = 50;

export const historyStore = {
  getAll() {
    return storage.get<HistoryEntry[]>('history', []);
  },

  add(videoId: string, title: string, sentenceCount = 0) {
    const history = this.getAll().filter((item) => item.videoId !== videoId);
    history.unshift({
      videoId,
      title: title || videoId,
      analyzedAt: Date.now(),
      sentenceCount,
    });
    storage.set('history', history.slice(0, MAX_HISTORY));
  },

  remove(videoId: string) {
    const history = this.getAll().filter((item) => item.videoId !== videoId);
    storage.set('history', history);
  },
};
