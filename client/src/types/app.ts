import type {
  ClozeExercise,
  FSIDrill,
  Sentence,
  SentenceFilters,
  SentenceProgress,
  TranscriptSegment,
  VideoData,
} from 'lingtube-shared';

export type TimingConfidence = 'low' | 'medium' | 'high';
export type TimingSource = 'ai' | 'transcript';

export type AlignedSentence = Sentence & {
  timingApproximate?: boolean;
  timingConfidence?: TimingConfidence;
  timingScore?: number;
  timingSource?: TimingSource;
  timingSegmentStartIndex?: number;
  timingSegmentEndIndex?: number;
};

export type AppVideoSession = {
  videoId: string;
  segments: TranscriptSegment[];
};

export type VideoStoreEntry = Partial<VideoData> & {
  videoId?: string;
  title?: string;
  segments?: TranscriptSegment[];
  sentences?: AlignedSentence[];
  clozeExercises?: ClozeExercise[];
  fsiDrills?: FSIDrill[];
  updatedAt?: number;
};

export type HistoryEntry = {
  videoId: string;
  title: string;
  analyzedAt: number;
  sentenceCount: number;
};

export type LearningProgressMap = Record<string, SentenceProgress>;
export type AllLearningProgress = Record<string, LearningProgressMap>;

export type StateSetter<T> = (value: T | ((current: T) => T)) => void;

export type AppContextValue = {
  currentVideo: AppVideoSession | null;
  setCurrentVideo: StateSetter<AppVideoSession | null>;
  sentences: AlignedSentence[];
  setSentences: StateSetter<AlignedSentence[]>;
  clozeExercises: ClozeExercise[];
  setClozeExercises: StateSetter<ClozeExercise[]>;
  fsiDrills: FSIDrill[];
  setFsiDrills: StateSetter<FSIDrill[]>;
  isAnalyzing: boolean;
  setIsAnalyzing: StateSetter<boolean>;
  activeSegmentIndex: number;
  setActiveSegmentIndex: StateSetter<number>;
  filters: SentenceFilters;
  setFilters: StateSetter<SentenceFilters>;
  resetVideo: () => void;
};

export const DEFAULT_SENTENCE_PROGRESS: SentenceProgress = {
  familiar: false,
  correctCount: 0,
  incorrectCount: 0,
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  lastReviewed: null,
  nextReview: null,
};
