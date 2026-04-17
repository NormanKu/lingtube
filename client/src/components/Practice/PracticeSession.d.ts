import type { ClozeExercise, FSIDrill } from 'lingtube-shared';
import type { AlignedSentence, LearningProgressMap } from '../../types/app';

export type PracticeSessionProps = {
  sentences?: AlignedSentence[];
  clozeExercises?: ClozeExercise[];
  fsiDrills?: FSIDrill[];
  learningProgress?: LearningProgressMap;
  currentTime?: number;
  onResult?: (sentenceId: string, quality: number) => void;
  onPlayAudio?: (sentenceId: string) => void;
  onComplete?: () => void;
};

export function PracticeSession(props: PracticeSessionProps): any;
