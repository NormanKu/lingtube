import { useMemo } from 'react';
import type { SentenceFilters } from 'lingtube-shared';
import { learningStore } from '../stores/learningStore';
import type { AlignedSentence } from '../types/app';

export function useFilteredSentences(
  sentences: AlignedSentence[],
  filters: SentenceFilters,
  videoId?: string
) {
  return useMemo(() => {
    if (!sentences?.length) return [] as AlignedSentence[];

    return sentences.filter((sentence) => {
      if (filters.categories?.length > 0) {
        const hasCategory = sentence.categories?.some((category) => (
          filters.categories.includes(category)
        ));
        if (!hasCategory) return false;
      }

      if (filters.difficulty && sentence.difficulty !== filters.difficulty) {
        return false;
      }

      if (filters.familiarity && filters.familiarity !== 'all' && videoId) {
        const progress = learningStore.getSentenceProgress(videoId, sentence.id);
        if (filters.familiarity === 'familiar' && !progress.familiar) return false;
        if (filters.familiarity === 'unfamiliar' && progress.familiar) return false;
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchOriginal = sentence.original?.toLowerCase().includes(query);
        const matchTranslation = sentence.translation?.toLowerCase().includes(query);
        if (!matchOriginal && !matchTranslation) return false;
      }

      return true;
    });
  }, [sentences, filters, videoId]);
}
