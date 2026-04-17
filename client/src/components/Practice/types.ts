import type { ClozeBlank, ClozeExercise, FSIDrill } from 'lingtube-shared';
import type { AlignedSentence } from '../../types/app';

export type AnswerMap = Record<number, string>;
export type HintMap = Record<number, boolean>;

export type ClozePassageItem = {
  exercise: ClozeExercise;
  sentence: AlignedSentence | null;
  originalIndex: number;
  startTime: number;
  endTime: number;
};

export type ClozePassage = {
  id: string;
  items: ClozePassageItem[];
  sentenceIds: string[];
  startTime: number | null;
  endTime: number | null;
  blankCount: number;
};

export type ClozeExerciseRow = ClozePassageItem & {
  parts: string[];
  blankOffset: number;
};

export type DrillOption = FSIDrill & {
  selectionId: string;
  sentence: AlignedSentence | null;
  startTime: number;
};

export type ClozePassageTestProps = {
  passage: ClozePassage | null;
  currentTime?: number;
  onResult?: (quality: number) => void;
  onNext?: () => void;
  onPlayAudio?: () => void;
};

export type ClozeTestProps = {
  exercise: ClozeExercise | null;
  sentence?: AlignedSentence | null;
  onResult?: (quality: number) => void;
  onNext?: () => void;
  onPlayAudio?: () => void;
};

export type DrillCardProps = {
  drill: DrillOption;
  onResult?: (quality: number) => void;
  onPlayAudio?: () => void;
};

export type FSIDrillProps = {
  drills: DrillOption[];
  onResult?: (sentenceId: string, quality: number) => void;
  onPlayAudio?: (sentenceId: string) => void;
};

export type ClozePracticeViewProps = {
  activePassages: ClozePassage[];
  currentIndex: number;
  currentTime?: number;
  currentSetLabel: string;
  selectionMode?: 'smart' | 'all' | 'custom';
  score: number;
  onBack: () => void;
  onRestart: () => void;
  onComplete?: () => void;
  onPassageResult: (quality: number) => void;
  onPassageNext: () => void;
  onPlayAudio?: (sentenceId: string) => void;
};

export type DrillPracticeViewProps = {
  activeDrills: DrillOption[];
  currentSetLabel: string;
  selectionMode: 'smart' | 'all' | 'custom';
  onBack: () => void;
  onResult?: (sentenceId: string, quality: number) => void;
  onPlayAudio?: (sentenceId: string) => void;
};

export type BlankStatus = 'neutral' | 'correct' | 'incorrect';

export type BlankChecker = (blank: ClozeBlank, index: number) => BlankStatus;
