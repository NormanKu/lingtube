import type { ClozeExercise, FSIDrill } from 'lingtube-shared';
import { storage } from './storage.js';
import type { AlignedSentence, VideoStoreEntry } from '../types/app';

export const videoStore = {
  get(videoId: string) {
    return storage.get(`video:${videoId}`, null) as VideoStoreEntry | null;
  },

  save(videoId: string, data: VideoStoreEntry) {
    storage.set(`video:${videoId}`, {
      ...data,
      updatedAt: Date.now(),
    });
  },

  saveSentences(videoId: string, sentences: AlignedSentence[]) {
    const existing = this.get(videoId) || {};
    this.save(videoId, { ...existing, sentences });
  },

  saveCloze(videoId: string, exercises: ClozeExercise[]) {
    const existing = this.get(videoId) || {};
    this.save(videoId, { ...existing, clozeExercises: exercises });
  },

  saveFSI(videoId: string, drills: FSIDrill[]) {
    const existing = this.get(videoId) || {};
    this.save(videoId, { ...existing, fsiDrills: drills });
  },
};
