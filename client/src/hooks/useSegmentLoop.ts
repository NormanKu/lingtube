import { useState, useEffect, useRef, useCallback } from 'react';
import type { VideoPlayerHandle } from '../components/VideoPlayer/VideoPlayer';

export interface SegmentLoopApi {
  loopStart: number | null;
  loopEnd: number | null;
  isLooping: boolean;
  startLoop: (start: number, end: number) => void;
  stopLoop: () => void;
}

type PlayerRef = { current: VideoPlayerHandle | null } | null | undefined;

export function useSegmentLoop(playerRef: PlayerRef): SegmentLoopApi {
  const [loopStart, setLoopStart] = useState(null as number | null);
  const [loopEnd, setLoopEnd] = useState(null as number | null);
  const [isLooping, setIsLooping] = useState(false);
  const intervalRef = useRef(null as ReturnType<typeof setInterval> | null);

  const startLoop = useCallback(
    (start: number, end: number) => {
      setLoopStart(start);
      setLoopEnd(end);
      setIsLooping(true);
      playerRef?.current?.seekTo(start);
    },
    [playerRef]
  );

  const stopLoop = useCallback(() => {
    setIsLooping(false);
    setLoopStart(null);
    setLoopEnd(null);
  }, []);

  useEffect(() => {
    if (!isLooping || loopStart == null || loopEnd == null) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const player = playerRef?.current;
      if (!player) return;
      try {
        const time = player.getCurrentTime?.();
        if (typeof time === 'number' && time >= loopEnd) {
          player.seekTo(loopStart);
        }
      } catch {
        // Player not ready
      }
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLooping, loopStart, loopEnd, playerRef]);

  return { loopStart, loopEnd, isLooping, startLoop, stopLoop };
}
