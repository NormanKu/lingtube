import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Eye, EyeOff, Play, SkipForward } from 'lucide-react';
import { Button } from '../Common/Button.jsx';
import type { AnswerMap, BlankChecker, BlankStatus, ClozeTestProps, HintMap } from './types';

export function ClozeTest({
  exercise,
  sentence,
  onResult,
  onNext,
  onPlayAudio,
}: ClozeTestProps) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({} as AnswerMap);
  const [revealed, setRevealed] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeBlank, setActiveBlank] = useState(0);
  const [showHints, setShowHints] = useState({} as HintMap);
  const inputRef = useRef(null as HTMLInputElement | null);

  useEffect(() => {
    setAnswers({});
    setRevealed(false);
    setShowTranslation(false);
    setActiveBlank(0);
    setShowHints({});
  }, [exercise?.sentenceId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeBlank]);

  if (!exercise) return null;

  const parts = exercise.blanked.split('___');
  const allFilled = exercise.blanks.every((_, index) => answers[index]?.trim());

  const handleCheck = () => {
    setRevealed(true);
    setShowTranslation(true);
  };

  const handleNext = (quality: number) => {
    onResult?.(quality);
    onNext?.();
  };

  const getBlankStatus: BlankChecker = (blank, index) => {
    if (!revealed) return 'neutral' as BlankStatus;
    const userAnswer = (answers[index] || '').trim().toLowerCase();
    return userAnswer === blank.answer.toLowerCase() ? 'correct' : 'incorrect';
  };

  const correctCount = revealed
    ? exercise.blanks.filter((blank, index) => (
      (answers[index] || '').trim().toLowerCase() === blank.answer.toLowerCase()
    )).length
    : 0;

  const renderTranslation = () => {
    if (!sentence?.translation) return null;
    return (
      <p className="text-base leading-relaxed text-gray-600">
        {sentence.translation}
      </p>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {t('practice.cloze')}
        </span>
        <div className="flex items-center gap-2">
          {onPlayAudio && (
            <button
              type="button"
              onClick={onPlayAudio}
              className="flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-200"
            >
              <Play size={12} />
              Play
            </button>
          )}
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="text-lg leading-[2.2] text-gray-800">
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < exercise.blanks.length && (() => {
                const blank = exercise.blanks[index];
                const status = getBlankStatus(blank, index);
                const isActive = !revealed && activeBlank === index;

                return (
                  <span className="mx-0.5 inline-flex flex-col items-center align-baseline">
                    {revealed ? (
                      <span
                        className={`inline-block border-b-2 px-1 font-medium ${
                          status === 'correct'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-red-400 bg-red-50 text-red-600'
                        }`}
                      >
                        {status === 'correct' ? answers[index] : blank.answer}
                        {status === 'incorrect' && answers[index]?.trim() && (
                          <span className="ml-1 text-xs text-red-400 line-through">{answers[index]}</span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex flex-col items-center">
                        <input
                          ref={isActive ? inputRef : null}
                          type="text"
                          value={answers[index] || ''}
                          onChange={(event: any) => setAnswers({ ...answers, [index]: event.target.value })}
                          onFocus={() => setActiveBlank(index)}
                          onKeyDown={(event: any) => {
                            if (event.key === 'Tab') {
                              event.preventDefault();
                              setActiveBlank((index + 1) % exercise.blanks.length);
                            } else if (event.key === 'Enter' && allFilled) {
                              handleCheck();
                            }
                          }}
                          placeholder="______"
                          className={`inline-block border-0 border-b-2 bg-transparent px-1 text-center text-lg font-medium outline-none transition-colors ${
                            isActive
                              ? 'border-primary-500 text-primary-700'
                              : 'border-gray-300 text-gray-600'
                          }`}
                          style={{ width: `${Math.max(blank.answer.length * 14, 100)}px` }}
                        />
                        {isActive && !showHints[index] && (
                          <button
                            type="button"
                            onClick={() => setShowHints({ ...showHints, [index]: true })}
                            className="mt-0.5 text-[10px] text-primary-400 hover:text-primary-600"
                          >
                            hint?
                          </button>
                        )}
                        {showHints[index] && (
                          <span className="mt-0.5 text-[10px] text-amber-500">{blank.hint}</span>
                        )}
                      </span>
                    )}
                  </span>
                );
              })()}
            </span>
          ))}
        </div>

        {revealed && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className={correctCount === exercise.blanks.length ? 'text-green-600' : 'text-amber-600'}>
              {correctCount}/{exercise.blanks.length} correct
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-amber-50/50 px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-amber-700">Translation</span>
          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
          >
            {showTranslation ? <EyeOff size={12} /> : <Eye size={12} />}
            {showTranslation ? 'Hide' : 'Show'}
          </button>
        </div>
        {showTranslation ? (
          renderTranslation()
        ) : (
          <p className="text-sm italic text-amber-400">Click &quot;Show&quot; to reveal translation</p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
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
