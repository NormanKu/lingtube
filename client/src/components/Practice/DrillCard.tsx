import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Play } from 'lucide-react';
import { Button } from '../Common/Button.jsx';
import { Badge } from '../Common/Badge.jsx';
import type { DrillCardProps } from './types';

export function DrillCard({ drill, onResult, onPlayAudio }: DrillCardProps) {
  const { t } = useTranslation();
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-1 flex items-center gap-2">
        <Badge label={t(`practice.${drill.drillType}`)} type={drill.difficulty} />
        <Badge label={t(`practice.${drill.difficulty}`)} type={drill.difficulty} />
      </div>

      <p className="mt-3 text-xs text-gray-400">{drill.originalSentence}</p>
      <p className="mt-2 text-base font-medium text-gray-800">{drill.prompt}</p>

      <textarea
        value={userAnswer}
        onChange={(event: any) => setUserAnswer(event.target.value)}
        rows={2}
        placeholder="Type your answer..."
        className="mt-3 w-full rounded-lg border-gray-200 text-sm focus:border-primary-300 focus:ring-primary-200"
      />

      {showAnswer && (
        <div className="mt-3 rounded-lg bg-green-50 p-3">
          <p className="text-sm font-medium text-green-800">{drill.expectedAnswer}</p>
          {drill.alternatives?.length > 0 && (
            <div className="mt-1">
              <p className="text-xs text-green-600">Also acceptable:</p>
              {drill.alternatives.map((alternative, index) => (
                <p key={index} className="text-xs text-green-600">- {alternative}</p>
              ))}
            </div>
          )}
          {drill.explanation && (
            <p className="mt-2 text-xs text-gray-500">{drill.explanation}</p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <Eye size={14} />
          {t('practice.showAnswer')}
        </Button>

        {onPlayAudio && (
          <Button variant="ghost" size="sm" onClick={onPlayAudio}>
            <Play size={14} />
            Play
          </Button>
        )}

        {showAnswer && (
          <>
            <Button variant="accent" size="sm" onClick={() => onResult?.(5)}>
              {t('practice.gotIt')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onResult?.(1)}>
              {t('practice.needsPractice')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
