import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AudioLines,
  BookOpen,
  Check,
  Clock3,
  Eye,
  EyeOff,
  Play,
  SkipForward,
} from 'lucide-react';
import { Button } from '../Common/Button.jsx';
import type {
  AnswerMap,
  BlankChecker,
  BlankStatus,
  ClozeExerciseRow,
  ClozePassageTestProps,
  HintMap,
} from './types';

function formatTimeRange(startTime: number | null, endTime: number | null) {
  const format = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (typeof startTime !== 'number') return null;
  if (typeof endTime !== 'number' || endTime <= startTime) return format(startTime);
  return `${format(startTime)}-${format(endTime)}`;
}

const PLAYBACK_LEAD_SECONDS = 0.25;
const PLAYBACK_TAIL_SECONDS = 0.6;

function isTimeWithinSentence(
  currentTime: number | undefined,
  sentence: ClozeExerciseRow['sentence']
) {
  if (!sentence || typeof currentTime !== 'number') return false;
  if (typeof sentence.startTime !== 'number' || typeof sentence.endTime !== 'number') return false;

  return (
    currentTime >= sentence.startTime - PLAYBACK_LEAD_SECONDS &&
    currentTime <= sentence.endTime + PLAYBACK_TAIL_SECONDS
  );
}

export function ClozePassageTest({
  passage,
  currentTime,
  onResult,
  onNext,
  onPlayAudio,
}: ClozePassageTestProps) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({} as AnswerMap);
  const [revealed, setRevealed] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeBlank, setActiveBlank] = useState(0);
  const [showHints, setShowHints] = useState({} as HintMap);
  const inputRef = useRef(null as HTMLInputElement | null);

  const exerciseRows = useMemo(() => {
    if (!passage?.items?.length) return [] as ClozeExerciseRow[];

    let blankOffset = 0;

    return passage.items.map((item) => {
      const row = {
        ...item,
        parts: item.exercise.blanked.split('___'),
        blankOffset,
      } satisfies ClozeExerciseRow;
      blankOffset += item.exercise.blanks.length;
      return row;
    });
  }, [passage]);

  const totalBlanks = useMemo(
    () => exerciseRows.reduce((sum: number, row: ClozeExerciseRow) => sum + row.exercise.blanks.length, 0),
    [exerciseRows]
  );

  useEffect(() => {
    setAnswers({});
    setRevealed(false);
    setShowTranslation(false);
    setActiveBlank(0);
    setShowHints({});
  }, [passage?.id]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeBlank]);

  if (!passage || !exerciseRows.length) return null;

  const allFilled = totalBlanks > 0 && exerciseRows.every((row: ClozeExerciseRow) =>
    row.exercise.blanks.every((_: unknown, blankIndex: number) => answers[row.blankOffset + blankIndex]?.trim())
  );

  const handleCheck = () => {
    setRevealed(true);
    setShowTranslation(true);
  };

  const handleNext = (quality: number) => {
    onResult?.(quality);
    onNext?.();
  };

  const getBlankStatus: BlankChecker = (blank, globalIndex) => {
    if (!revealed) return 'neutral' as BlankStatus;
    const userAnswer = (answers[globalIndex] || '').trim().toLowerCase();
    return userAnswer === blank.answer.toLowerCase() ? 'correct' : 'incorrect';
  };

  const correctCount = revealed
    ? exerciseRows.reduce((sum: number, row: ClozeExerciseRow) => (
      sum + row.exercise.blanks.filter((blank, blankIndex: number) => {
        const globalIndex = row.blankOffset + blankIndex;
        return (answers[globalIndex] || '').trim().toLowerCase() === blank.answer.toLowerCase();
      }).length
    ), 0)
    : 0;

  const timeRange = formatTimeRange(passage.startTime, passage.endTime);
  const translationLines = exerciseRows
    .map((row: ClozeExerciseRow) => row.sentence?.translation)
    .filter(Boolean);
  const activePlaybackRowIndex = exerciseRows.findIndex((row: ClozeExerciseRow) =>
    isTimeWithinSentence(currentTime, row.sentence)
  );
  const activePlaybackRow = activePlaybackRowIndex >= 0 ? exerciseRows[activePlaybackRowIndex] : null;

  return (
    <div className="overflow-hidden rounded-[28px] border border-stone-200/80 bg-gradient-to-br from-stone-50 via-white to-amber-50/40 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)]">
      <div className="border-b border-stone-200/70 bg-white/75 px-5 py-4 backdrop-blur-sm sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-stone-600">
              <BookOpen size={13} />
              {t('practice.passage')}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-stone-500">
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1">
                {t('practice.relatedSentences', { count: passage.items.length })}
              </span>
              <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1">
                {totalBlanks} blanks
              </span>
              {timeRange && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/80 px-3 py-1">
                  <Clock3 size={13} />
                  {timeRange}
                </span>
              )}
              {activePlaybackRow && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-primary-700">
                  <AudioLines size={13} />
                  {t('practice.nowPlaying')}
                </span>
              )}
            </div>
          </div>

          {onPlayAudio && (
            <button
              type="button"
              onClick={onPlayAudio}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <Play size={14} />
              {t('practice.playPassage')}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[44rem] rounded-[26px] border border-stone-200/80 bg-white/94 px-6 py-7 shadow-[0_24px_48px_-34px_rgba(15,23,42,0.45)] sm:px-8 sm:py-8">
          <div className="mb-5 flex items-center justify-between gap-3 text-xs text-stone-500">
            <span className="font-medium uppercase tracking-[0.18em] text-stone-400">
              Read In Context
            </span>
            {revealed && (
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                correctCount === totalBlanks
                  ? 'bg-green-50 text-green-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {correctCount}/{totalBlanks} correct
              </span>
            )}
          </div>

          <article
            className="text-[1.1rem] leading-[2.45] text-stone-800 sm:text-[1.18rem]"
            style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
          >
            {exerciseRows.map((row: ClozeExerciseRow, rowIndex: number) => (
              <span
                key={row.exercise.sentenceId}
                className={`rounded-xl px-1.5 py-0.5 transition-all ${
                  activePlaybackRowIndex === rowIndex
                    ? 'bg-primary-50/90 ring-1 ring-primary-100'
                    : ''
                } ${rowIndex === 0 ? 'first-letter:mr-1 first-letter:text-[1.9em] first-letter:font-semibold first-letter:leading-none first-letter:text-stone-700' : ''}`}
              >
                {row.parts.map((part: string, blankIndex: number) => (
                  <span key={blankIndex}>
                    {part}
                    {blankIndex < row.exercise.blanks.length && (() => {
                      const blank = row.exercise.blanks[blankIndex];
                      const globalIndex = row.blankOffset + blankIndex;
                      const status = getBlankStatus(blank, globalIndex);
                      const isActive = !revealed && activeBlank === globalIndex;
                      const isPlayingBlank = activePlaybackRowIndex === rowIndex;

                      return (
                        <span className="mx-0.5 inline-flex flex-col items-center align-baseline">
                          {revealed ? (
                            <span
                              className={`inline-block rounded-t-md border-b-2 px-1.5 font-semibold ${
                                status === 'correct'
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : 'border-red-400 bg-red-50 text-red-600'
                              }`}
                            >
                              {status === 'correct' ? answers[globalIndex] : blank.answer}
                              {status === 'incorrect' && answers[globalIndex]?.trim() && (
                                <span className="ml-1 text-xs text-red-400 line-through">
                                  {answers[globalIndex]}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="inline-flex flex-col items-center">
                              <input
                                ref={isActive ? inputRef : null}
                                type="text"
                                value={answers[globalIndex] || ''}
                                onChange={(event: any) => setAnswers({ ...answers, [globalIndex]: event.target.value })}
                                onFocus={() => setActiveBlank(globalIndex)}
                                onKeyDown={(event: any) => {
                                  if (event.key === 'Tab') {
                                    event.preventDefault();
                                    setActiveBlank((globalIndex + 1) % totalBlanks);
                                  } else if (event.key === 'Enter' && allFilled) {
                                    handleCheck();
                                  }
                                }}
                                placeholder="______"
                                className={`inline-block rounded-t-md border-0 border-b-2 px-1.5 text-center text-lg font-semibold outline-none transition-colors ${
                                  isActive
                                    ? 'border-primary-500 bg-primary-50/70 text-primary-700 shadow-[0_6px_18px_-14px_rgba(37,99,235,0.9)]'
                                    : isPlayingBlank
                                      ? 'border-primary-300 bg-primary-50/50 text-primary-800 shadow-[0_6px_18px_-16px_rgba(37,99,235,0.75)]'
                                      : 'border-stone-300 bg-stone-50 text-stone-700'
                                }`}
                                style={{ width: `${Math.max(blank.answer.length * 14, 96)}px` }}
                              />
                              {isActive && !showHints[globalIndex] && (
                                <button
                                  type="button"
                                  onClick={() => setShowHints({ ...showHints, [globalIndex]: true })}
                                  className="mt-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-500 hover:bg-primary-100 hover:text-primary-600"
                                >
                                  hint?
                                </button>
                              )}
                              {showHints[globalIndex] && (
                                <span className="mt-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600">
                                  {blank.hint}
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </span>
                ))}
                {rowIndex < exerciseRows.length - 1 && <span className="mr-1"> </span>}
              </span>
            ))}
          </article>
        </div>
      </div>

      <div className="border-t border-stone-200/70 bg-amber-50/65 px-5 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">
              Translation
            </p>
            <p className="mt-1 text-sm text-amber-800/70">
              Review the whole passage after you answer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm transition-colors hover:bg-white"
          >
            {showTranslation ? <EyeOff size={12} /> : <Eye size={12} />}
            {showTranslation ? 'Hide' : 'Show'}
          </button>
        </div>

        {showTranslation ? (
          <div className="space-y-3 rounded-2xl border border-amber-100 bg-white/75 px-4 py-4">
            {translationLines.map((line: string, index: number) => (
              <p key={`${index}-${line}`} className="text-base leading-relaxed text-stone-600">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-amber-500">Click &quot;Show&quot; to reveal translation</p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-stone-200/70 bg-white/80 px-5 py-4 sm:px-6">
        {!revealed ? (
          <>
            <Button onClick={handleCheck} disabled={!allFilled}>
              <Check size={14} />
              {t('practice.check')}
            </Button>
            <Button variant="ghost" onClick={() => handleNext(0)}>
              <SkipForward size={14} />
              {t('practice.skip')}
            </Button>
          </>
        ) : (
          <>
            <Button variant="accent" onClick={() => handleNext(5)}>
              {t('practice.gotIt')}
            </Button>
            <Button variant="secondary" onClick={() => handleNext(1)}>
              {t('practice.needsPractice')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
