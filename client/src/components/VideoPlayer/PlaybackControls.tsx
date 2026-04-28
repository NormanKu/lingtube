import { useState } from 'react';
import { Repeat, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '../Common/Button.jsx';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

type PlaybackControlsProps = {
  playerRef: any;
  loop: any;
  onToggleLoop: () => void;
};

export function PlaybackControls({
  playerRef,
  loop,
  onToggleLoop,
}: PlaybackControlsProps) {
  const [speed, setSpeed] = useState(1);

  const handleSpeed = (rate: number) => {
    setSpeed(rate);
    playerRef?.current?.setPlaybackRate(rate);
  };

  const seek = (delta: number) => {
    const player = playerRef?.current;
    if (player) {
      const time = player.getCurrentTime() || 0;
      player.seekTo(Math.max(0, time + delta));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 px-4 py-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => seek(-5)}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
          title="Back 5s"
        >
          <SkipBack size={16} />
        </button>
        <button
          type="button"
          onClick={() => seek(5)}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-200"
          title="Forward 5s"
        >
          <SkipForward size={16} />
        </button>
      </div>

      <div className="h-5 w-px bg-gray-300" />

      <div className="flex items-center gap-1">
        <span className="mr-1 text-xs text-gray-500">Speed:</span>
        {SPEEDS.map((speedOption) => (
          <button
            key={speedOption}
            type="button"
            onClick={() => handleSpeed(speedOption)}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              speed === speedOption
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {speedOption}x
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-gray-300" />

      <Button
        variant={loop?.isLooping ? 'accent' : 'ghost'}
        size="sm"
        onClick={onToggleLoop}
        title="Toggle loop (L)"
      >
        <Repeat size={14} />
        Loop
      </Button>
    </div>
  );
}
