import { createContext, useCallback, useContext, useState } from 'react';
import type { SentenceFilters } from 'lingtube-shared';
import type { AppContextValue } from '../types/app';

const DEFAULT_FILTERS: SentenceFilters = {
  categories: [],
  difficulty: null,
  familiarity: 'all',
  search: '',
};

const AppContext = createContext(null as AppContextValue | null);

type AppProviderProps = {
  children: any;
};

export function AppProvider({ children }: AppProviderProps) {
  const [currentVideo, setCurrentVideo] = useState(null as AppContextValue['currentVideo']);
  const [sentences, setSentences] = useState([] as AppContextValue['sentences']);
  const [clozeExercises, setClozeExercises] = useState([] as AppContextValue['clozeExercises']);
  const [fsiDrills, setFsiDrills] = useState([] as AppContextValue['fsiDrills']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const resetVideo = useCallback(() => {
    setCurrentVideo(null);
    setSentences([]);
    setClozeExercises([]);
    setFsiDrills([]);
    setActiveSegmentIndex(-1);
  }, []);

  const value = {
    currentVideo,
    setCurrentVideo,
    sentences,
    setSentences,
    clozeExercises,
    setClozeExercises,
    fsiDrills,
    setFsiDrills,
    isAnalyzing,
    setIsAnalyzing,
    activeSegmentIndex,
    setActiveSegmentIndex,
    filters,
    setFilters,
    resetVideo,
  } as AppContextValue;

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext) as AppContextValue | null;
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
