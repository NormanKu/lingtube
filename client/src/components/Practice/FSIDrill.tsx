import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DrillCard } from './DrillCard';
import type { DrillOption, FSIDrillProps } from './types';

const DRILL_TYPES = ['substitution', 'transformation', 'response'] as const;

export function FSIDrill({ drills, onResult, onPlayAudio }: FSIDrillProps) {
  const { t } = useTranslation();
  const [activeType, setActiveType] = useState('substitution' as typeof DRILL_TYPES[number]);

  const filtered = useMemo(
    () => drills?.filter((drill) => drill.drillType === activeType) || [],
    [drills, activeType]
  );

  if (!drills?.length) {
    return (
      <div className="py-12 text-center text-gray-400">
        No FSI drills generated yet
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
        {DRILL_TYPES.map((type) => {
          const count = drills.filter((drill) => drill.drillType === type).length;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeType === type
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`practice.${type}`)}
              <span className="ml-1 text-xs text-gray-400">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filtered.map((drill: DrillOption, index: number) => (
          <DrillCard
            key={`${drill.sentenceId}-${drill.drillType}-${index}`}
            drill={drill}
            onResult={(quality: number) => onResult?.(drill.sentenceId, quality)}
            onPlayAudio={() => onPlayAudio?.(drill.sentenceId)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            No {t(`practice.${activeType}`).toLowerCase()} drills available
          </p>
        )}
      </div>
    </div>
  );
}
