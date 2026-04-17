import { useState, useEffect, useRef, useCallback } from 'react';

export function useSegmentLoop(playerRef) {
  const [loopStart, setLoopStart] = useState(null);
  const [loopEnd, setLoopEnd] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const intervalRef = useRef(null);

  const startLoop = useCallback((start, end) => {
    setLoopStart(start);
    setLoopEnd(end);
    setIsLooping(true);
    playerRef?.current?.seekTo(start);
  }, [playerRef]);

  const stopLoop = useCallback(() => {
    setIsLooping(false);
    setLoopStart(null);
    setLoopEnd(null);
  }, []);

  useEffect(() => {
    if (!isLooping || loopStart == null || loopEnd == null) {
      clearInterval(intervalRef.current);
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

    return () => clearInterval(intervalRef.current);
  }, [isLooping, loopStart, loopEnd, playerRef]);

  return { loopStart, loopEnd, isLooping, startLoop, stopLoop };
}
