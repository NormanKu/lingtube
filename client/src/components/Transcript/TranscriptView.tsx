import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import type { SentenceFilters, TranscriptSegment } from 'lingtube-shared';
import { TranscriptPanel } from './TranscriptPanel';
import { SentenceCard } from './SentenceCard';
import { Button } from '../Common/Button.jsx';
import { SentenceSkeleton } from '../Common/LoadingSpinner.jsx';
import { FilterBar } from '../Common/FilterBar.jsx';
import type { AlignedSentence, LearningProgressMap } from '../../types/app';

type TranscriptViewProps = {
  segments: TranscriptSegment[];
  sentences: AlignedSentence[];
  filteredSentences?: AlignedSentence[];
  activeSegmentIndex: number;
  isAnalyzing: boolean;
  videoId?: string;
  filters: SentenceFilters;
  onSeek: (time: number) => void;
  onAnalyze: () => void;
  onToggleFamiliar: (sentenceId: string) => void;
  onFiltersChange: (filters: SentenceFilters) => void;
  learningProgress?: LearningProgressMap;
};

export function TranscriptView({
  segments,
  sentences,
  filteredSentences = [],
  activeSegmentIndex,
  isAnalyzing,
  videoId,
  filters,
  onSeek,
  onAnalyze,
  onToggleFamiliar,
  onFiltersChange,
  learningProgress,
}: TranscriptViewProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('raw' as 'raw' | 'key');
  const sentenceCount = sentences?.length ?? 0;
  const segmentCount = segments?.length ?? 0;
  const panelIdBase = videoId || 'current';
  const rawTabId = `transcript-tab-raw-${panelIdBase}`;
  const keyTabId = `transcript-tab-key-${panelIdBase}`;
  const rawPanelId = `transcript-panel-raw-${panelIdBase}`;
  const keyPanelId = `transcript-panel-key-${panelIdBase}`;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-gray-200" role="tablist" aria-label="Transcript sections">
        <button
          type="button"
          role="tab"
          id={rawTabId}
          aria-selected={tab === 'raw'}
          aria-controls={rawPanelId}
          tabIndex={tab === 'raw' ? 0 : -1}
          onClick={() => setTab('raw')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            tab === 'raw'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('video.rawTranscript')}
        </button>
        <button
          type="button"
          role="tab"
          id={keyTabId}
          aria-selected={tab === 'key'}
          aria-controls={keyPanelId}
          tabIndex={tab === 'key' ? 0 : -1}
          onClick={() => setTab('key')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            tab === 'key'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('video.keySentences')}
          {sentenceCount > 0 && (
            <span className="ml-1.5 rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
              {sentenceCount}
            </span>
          )}
        </button>

        {tab === 'raw' && segmentCount > 0 && sentenceCount === 0 && (
          <div className="ml-auto pr-3">
            <Button size="sm" onClick={onAnalyze} disabled={isAnalyzing}>
              <Sparkles size={14} />
              {isAnalyzing ? t('home.analyzing') : t('video.analyzeBtn')}
            </Button>
          </div>
        )}
      </div>

      <div
        role="tabpanel"
        id={rawPanelId}
        aria-labelledby={rawTabId}
        hidden={tab !== 'raw'}
        className={tab === 'raw' ? 'flex-1 min-h-0' : 'hidden'}
      >
        <TranscriptPanel
          segments={segments}
          sentences={sentences}
          activeIndex={activeSegmentIndex}
          onSeek={onSeek}
        />
      </div>

      <div
        role="tabpanel"
        id={keyPanelId}
        aria-labelledby={keyTabId}
        hidden={tab !== 'key'}
        className={tab === 'key' ? 'flex-1 min-h-0' : 'hidden'}
      >
        {isAnalyzing ? (
          <SentenceSkeleton />
        ) : sentenceCount > 0 ? (
          <div className="flex h-full flex-col overflow-hidden">
            <FilterBar filters={filters} onChange={onFiltersChange} />
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {filteredSentences.map((sentence) => (
                <SentenceCard
                  key={sentence.id}
                  sentence={sentence}
                  isFamiliar={learningProgress?.[sentence.id]?.familiar}
                  isActive={false}
                  onSeek={onSeek}
                  onToggleFamiliar={onToggleFamiliar}
                />
              ))}
              {filteredSentences.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">
                  No sentences match the current filters
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-sm text-gray-400">
              Click &quot;{t('video.analyzeBtn')}&quot; above to extract key sentences
            </p>
            <Button onClick={onAnalyze} disabled={isAnalyzing || !segments?.length}>
              <Sparkles size={16} />
              {t('video.analyzeBtn')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
