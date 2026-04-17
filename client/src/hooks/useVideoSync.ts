import { useEffect, useRef, useState } from 'react';

type TranscriptSegment = {
  start: number;
  duration: number;
};

type PlayerLike = {
  getCurrentTime?: () => number;
};

type PlayerRefLike = {
  current?: PlayerLike | null;
};

export function useVideoSync(playerRef: PlayerRefLike, segments: TranscriptSegment[] = []) {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const frameRef = useRef(null as number | null);
  const activeIndexRef = useRef(-1);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    const findActiveSegmentIndex = (time: number) => {
      if (!segments?.length) return -1;

      const currentIndex = activeIndexRef.current;
      const isInSegment = (index: number) => {
        const segment = segments[index];
        return Boolean(
          segment && time >= segment.start && time < segment.start + segment.duration
        );
      };

      if (isInSegment(currentIndex)) {
        return currentIndex;
      }

      const localSearchRadius = 3;
      const start = Math.max(0, currentIndex - localSearchRadius);
      const end = Math.min(segments.length - 1, currentIndex + localSearchRadius);

      for (let index = start; index <= end; index += 1) {
        if (isInSegment(index)) {
          return index;
        }
      }

      if (currentIndex >= 0) {
        if (time >= segments[currentIndex].start + segments[currentIndex].duration) {
          for (let index = currentIndex + localSearchRadius + 1; index < segments.length; index += 1) {
            if (isInSegment(index)) return index;
            if (segments[index].start > time) break;
          }
        } else {
          for (let index = currentIndex - localSearchRadius - 1; index >= 0; index -= 1) {
            if (isInSegment(index)) return index;
            if (segments[index].start + segments[index].duration < time) break;
          }
        }
      }

      return -1;
    };

    const sync = () => {
      const player = playerRef?.current;
      if (!player) {
        frameRef.current = window.requestAnimationFrame(sync);
        return;
      }

      try {
        const time = player.getCurrentTime?.();
        if (typeof time === 'number') {
          if (Math.abs(time - currentTimeRef.current) >= 0.05) {
            currentTimeRef.current = time;
            setCurrentTime(time);
          }

          const nextActiveIndex = findActiveSegmentIndex(time);
          if (nextActiveIndex !== activeIndexRef.current) {
            activeIndexRef.current = nextActiveIndex;
            setActiveSegmentIndex(nextActiveIndex);
          }
        }
      } catch {
        // Player not ready
      }

      frameRef.current = window.requestAnimationFrame(sync);
    };

    activeIndexRef.current = -1;
    currentTimeRef.current = 0;
    setCurrentTime(0);
    setActiveSegmentIndex(-1);
    frameRef.current = window.requestAnimationFrame(sync);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [playerRef, segments]);

  return { currentTime, activeSegmentIndex };
}
