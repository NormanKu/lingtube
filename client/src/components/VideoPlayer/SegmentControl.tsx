import { useState } from 'react';
import { Button } from '../Common/Button.jsx';

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

type SegmentControlProps = {
  playerRef: any;
  onStartLoop: (start: number, end: number) => void;
  onStopLoop: () => void;
  isLooping: boolean;
};

export function SegmentControl({
  playerRef,
  onStartLoop,
  onStopLoop,
  isLooping,
}: SegmentControlProps) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);

  const markStart = () => {
    const time = playerRef?.current?.getCurrentTime() || 0;
    setStartTime(Math.floor(time));
  };

  const markEnd = () => {
    const time = playerRef?.current?.getCurrentTime() || 0;
    setEndTime(Math.ceil(time));
  };

  const handleLoop = () => {
    if (isLooping) {
      onStopLoop();
    } else {
      onStartLoop(startTime, endTime);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={markStart}>
          Set A ({formatTime(startTime)})
        </Button>
        <span className="text-gray-400">-</span>
        <Button variant="ghost" size="sm" onClick={markEnd}>
          Set B ({formatTime(endTime)})
        </Button>
      </div>
      <Button
        variant={isLooping ? 'danger' : 'accent'}
        size="sm"
        onClick={handleLoop}
      >
        {isLooping ? 'Stop Loop' : 'Start A-B Loop'}
      </Button>
    </div>
  );
}
