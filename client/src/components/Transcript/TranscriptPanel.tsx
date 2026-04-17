import { useEffect, useMemo, useRef } from 'react';
import type { TranscriptSegment } from 'lingtube-shared';
import type { AlignedSentence } from '../../types/app';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type TranscriptPanelProps = {
  segments: TranscriptSegment[];
  sentences: AlignedSentence[];
  activeIndex: number;
  onSeek: (time: number) => void;
};

export function TranscriptPanel({
  segments,
  sentences,
  activeIndex,
  onSeek,
}: TranscriptPanelProps) {
  const activeRef = useRef(null as HTMLButtonElement | null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  const translationMap = useMemo(() => {
    if (!sentences?.length || !segments?.length) return {} as Record<number, string>;

    const map = {} as Record<number, string>;
    for (const sentence of sentences) {
      let idx = Number.isInteger(sentence.timingSegmentStartIndex)
        ? sentence.timingSegmentStartIndex
        : -1;

      if (idx === -1 && sentence.timingConfidence !== 'low') {
        idx = segments.findIndex((segment) => Math.abs(segment.start - sentence.startTime) < 2);
      }

      if (typeof idx === 'number' && idx !== -1) {
        map[idx] = sentence.translation;
      }
    }
    return map;
  }, [segments, sentences]);

  if (!segments?.length) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        No transcript available
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {segments.map((segment, index) => {
        const translation = translationMap[index];
        return (
          <button
            key={index}
            type="button"
            ref={index === activeIndex ? activeRef : null}
            onClick={() => onSeek(segment.start)}
            className={`block w-full border-b border-gray-50 px-4 py-2 text-left transition-colors hover:bg-blue-50 ${
              index === activeIndex ? 'border-l-4 border-l-primary-500 bg-primary-50' : ''
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-xs tabular-nums text-gray-400">
                {formatTime(segment.start)}
              </span>
              <div className="min-w-0">
                <span className="text-sm text-gray-700">{segment.text}</span>
                {translation && (
                  <p className="mt-0.5 text-xs text-amber-600">{translation}</p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
