import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import type { TranscriptResponse, VideoData } from 'lingtube-shared';
import VideoPlayer, { type VideoPlayerHandle } from '../components/VideoPlayer/VideoPlayer';
import { PlaybackControls } from '../components/VideoPlayer/PlaybackControls';
import { SegmentControl } from '../components/VideoPlayer/SegmentControl';
import { TranscriptView } from '../components/Transcript/TranscriptView';
import { ProgressDashboard } from '../components/Learning/ProgressDashboard';
import { Button } from '../components/Common/Button.jsx';
import { LoadingSpinner } from '../components/Common/LoadingSpinner.jsx';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { useVideoSync } from '../hooks/useVideoSync';
import { useSegmentLoop } from '../hooks/useSegmentLoop.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { useFilteredSentences } from '../hooks/useFilteredSentences';
import { useLearning } from '../hooks/useLearning';
import { videoStore } from '../stores/videoStore';
import { historyStore } from '../stores/historyStore';
import {
  analyzeKeySentences,
  fetchTranscript,
  generateCloze,
  generateFSIDrills,
  loadVideoData,
} from '../services/api';
import { alignSentencesToSegments } from '../utils/alignSentences.js';

export function VideoPage() {
  const params = useParams() as { videoId?: string };
  const videoId = params.videoId ?? '';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const playerRef = useRef(null as VideoPlayerHandle | null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const {
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
    filters,
    setFilters,
    resetVideo,
  } = useApp();
  const { markFamiliar, markUnfamiliar, getProgress, getSentenceProgress } = useLearning();

  const segments = currentVideo?.segments || [];
  const { activeSegmentIndex } = useVideoSync(playerRef, segments);
  const loop = useSegmentLoop(playerRef);
  const learningProgress = getProgress(videoId);
  const filteredSentences = useFilteredSentences(sentences, filters, videoId);

  useKeyboardShortcuts(playerRef, {
    onToggleLoop: () => (loop.isLooping ? loop.stopLoop() : null),
  });

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!videoId) return;
      resetVideo();

      try {
        const data = await loadVideoData(videoId);
        const alignedSentences = alignSentencesToSegments(data.sentences || [], data.segments || []);
        if (cancelled) return;
        setCurrentVideo({ videoId: data.videoId, segments: data.segments });
        setSentences(alignedSentences);
        setClozeExercises(data.clozeExercises || []);
        setFsiDrills(data.fsiDrills || []);
        videoStore.save(videoId, { ...data, sentences: alignedSentences });
        return;
      } catch {
        // No pre-generated data, continue
      }

      const saved = videoStore.get(videoId);
      if (saved?.segments) {
        const alignedSentences = alignSentencesToSegments(saved.sentences || [], saved.segments || []);
        if (cancelled) return;
        setCurrentVideo({ videoId, segments: saved.segments });
        setSentences(alignedSentences);
        setClozeExercises(saved.clozeExercises || []);
        setFsiDrills(saved.fsiDrills || []);
        if (saved.sentences) {
          videoStore.save(videoId, { ...saved, sentences: alignedSentences });
        }
        return;
      }

      try {
        const data = await fetchTranscript(`https://youtube.com/watch?v=${videoId}`);
        if (cancelled) return;
        setCurrentVideo({ videoId: data.videoId, segments: data.segments });
        videoStore.save(videoId, { segments: data.segments });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('errors.video.loadData');
        console.error('Failed to load video data:', err);
        showToast({
          tone: 'error',
          title: t('common.error'),
          message,
        });
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [resetVideo, setClozeExercises, setCurrentVideo, setFsiDrills, setSentences, showToast, t, videoId]);

  const handleSeek = useCallback((time: number) => {
    playerRef.current?.seekTo(time);
  }, []);

  const handleAnalyze = async () => {
    if (!segments.length || !videoId) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeKeySentences(segments);
      if (!isMountedRef.current) return;
      const alignedSentences = alignSentencesToSegments(result.sentences, segments);
      setSentences(alignedSentences);
      videoStore.saveSentences(videoId, alignedSentences);
      const resolvedTitle = videoStore.get(videoId)?.title
        || historyStore.getAll().find((item) => item.videoId === videoId)?.title
        || videoId;
      historyStore.add(videoId, resolvedTitle, alignedSentences.length);

      const [clozeResult, fsiResult] = await Promise.all([
        generateCloze(alignedSentences).catch((err: unknown) => {
          if (!isMountedRef.current) return { exercises: [] };
          const message = err instanceof Error ? err.message : t('errors.video.cloze');
          showToast({
            tone: 'warning',
            title: t('common.error'),
            message,
          });
          return { exercises: [] };
        }),
        generateFSIDrills(alignedSentences).catch((err: unknown) => {
          if (!isMountedRef.current) return { drills: [] };
          const message = err instanceof Error ? err.message : t('errors.video.fsi');
          showToast({
            tone: 'warning',
            title: t('common.error'),
            message,
          });
          return { drills: [] };
        }),
      ]);

      if (!isMountedRef.current) return;
      setClozeExercises(clozeResult.exercises);
      setFsiDrills(fsiResult.drills);
      videoStore.saveCloze(videoId, clozeResult.exercises);
      videoStore.saveFSI(videoId, fsiResult.drills);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : t('errors.video.analyze');
      console.error('Analysis failed:', err);
      showToast({
        tone: 'error',
        title: t('common.error'),
        message,
      });
    } finally {
      if (isMountedRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleToggleFamiliar = (sentenceId: string) => {
    const progress = getSentenceProgress(videoId, sentenceId);
    if (progress.familiar) {
      markUnfamiliar(videoId, sentenceId);
    } else {
      markFamiliar(videoId, sentenceId);
    }
  };

  if (!currentVideo && !videoId) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <VideoPlayer ref={playerRef} videoId={videoId} />
        <PlaybackControls
          playerRef={playerRef}
          loop={loop}
          onToggleLoop={() => (loop.isLooping ? loop.stopLoop() : null)}
        />
        <SegmentControl
          playerRef={playerRef}
          isLooping={loop.isLooping}
          onStartLoop={loop.startLoop}
          onStopLoop={loop.stopLoop}
        />

        {sentences?.length > 0 && (
          <div className="space-y-4">
            <ProgressDashboard
              sentences={sentences}
              learningProgress={learningProgress}
            />
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate(`/practice/${videoId}`)}
              disabled={!clozeExercises?.length && !fsiDrills?.length}
            >
              <Play size={16} />
              {t('video.startPractice')}
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white lg:sticky lg:top-16 lg:col-span-2 lg:h-[calc(100vh-5rem)]">
        <TranscriptView
          segments={segments}
          sentences={sentences}
          filteredSentences={filteredSentences}
          activeSegmentIndex={activeSegmentIndex}
          isAnalyzing={isAnalyzing}
          videoId={videoId}
          filters={filters}
          onSeek={handleSeek}
          onAnalyze={handleAnalyze}
          onToggleFamiliar={handleToggleFamiliar}
          onFiltersChange={setFilters}
          learningProgress={learningProgress}
        />
      </div>
    </div>
  );
}
