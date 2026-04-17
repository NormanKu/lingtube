import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { HomeCliHint } from '../components/Home/HomeCliHint';
import { HomeFeatureGrid } from '../components/Home/HomeFeatureGrid';
import { HomeHero } from '../components/Home/HomeHero';
import { AvailableVideosSection, RecentVideosSection } from '../components/Home/HomeVideoSections';
import { historyStore } from '../stores/historyStore';
import { videoStore } from '../stores/videoStore';
import { fetchTranscript, listVideos, loadVideoData, type AvailableVideoSummary } from '../services/api';
import { alignSentencesToSegments } from '../utils/alignSentences.js';
import type { HistoryEntry } from '../types/app';
import type { TranscriptSegment, VideoData } from 'lingtube-shared';

type TranscriptOnlyVideo = {
  videoId: string;
  title: string;
  segments: TranscriptSegment[];
};

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setCurrentVideo, setSentences, setClozeExercises, setFsiDrills, resetVideo } = useApp();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => historyStore.getAll());
  const [availableVideos, setAvailableVideos] = useState([] as AvailableVideoSummary[]);
  const [isLoadingAvailableVideos, setIsLoadingAvailableVideos] = useState(true);
  // Track latest click to cancel stale responses from rapid double-clicks
  const activeRequestRef = useRef(0);

  const resolveKnownTitle = (videoId: string, fallbackTitle = '') => (
    fallbackTitle
    || availableVideos.find((video: AvailableVideoSummary) => video.videoId === videoId)?.title
    || videoStore.get(videoId)?.title
    || history.find((item: HistoryEntry) => item.videoId === videoId)?.title
    || videoId
  );

  useEffect(() => {
    setIsLoadingAvailableVideos(true);

    listVideos()
      .then((response) => setAvailableVideos(response.videos || []))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : t('errors.home.loadVideos');
        showToast({
          tone: 'warning',
          title: t('common.error'),
          message,
        });
      })
      .finally(() => {
        setIsLoadingAvailableVideos(false);
      });
  }, [showToast, t]);

  const syncHistoryState = () => {
    setHistory(historyStore.getAll());
  };

  const openGeneratedVideo = (data: VideoData) => {
    const alignedSentences = alignSentencesToSegments(data.sentences || [], data.segments || []);

    setCurrentVideo({ videoId: data.videoId, segments: data.segments });
    setSentences(alignedSentences);
    setClozeExercises(data.clozeExercises || []);
    setFsiDrills(data.fsiDrills || []);
    videoStore.save(data.videoId, { ...data, sentences: alignedSentences });
    historyStore.add(data.videoId, data.title || data.videoId, alignedSentences.length || 0);
    syncHistoryState();
    navigate(`/video/${data.videoId}`);
  };

  const openTranscriptOnlyVideo = ({ videoId, title, segments }: TranscriptOnlyVideo) => {
    setCurrentVideo({ videoId, segments });
    videoStore.save(videoId, { title, segments });
    historyStore.add(videoId, title, 0);
    syncHistoryState();
    navigate(`/video/${videoId}`);
  };

  const isNotFoundError = (err: unknown): boolean => {
    if (!(err instanceof Error)) return false;
    const message = err.message.toLowerCase();
    return message.includes('no data') || message.includes('404') || message.includes('not found');
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    const requestId = ++activeRequestRef.current;
    setError('');
    setLoading(true);
    resetVideo();

    const idMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    const videoId = idMatch?.[1];

    try {
      if (videoId) {
        try {
          const data = await loadVideoData(videoId);
          if (requestId !== activeRequestRef.current) return;
          openGeneratedVideo(data);
          return;
        } catch (err: unknown) {
          // If data exists but is corrupted, surface that; otherwise fall through.
          if (!isNotFoundError(err)) {
            const message = err instanceof Error ? err.message : t('errors.home.corruptedData');
            showToast({
              tone: 'warning',
              title: t('common.error'),
              message,
            });
          }
        }
      }

      const data = await fetchTranscript(url.trim());
      if (requestId !== activeRequestRef.current) return;
      const resolvedTitle = resolveKnownTitle(data.videoId, data.title);
      openTranscriptOnlyVideo({
        videoId: data.videoId,
        title: resolvedTitle,
        segments: data.segments,
      });
    } catch (err: unknown) {
      if (requestId !== activeRequestRef.current) return;
      const message = err instanceof Error ? err.message : t('errors.home.openVideo');
      setError(message);
      showToast({
        tone: 'error',
        title: t('common.error'),
        message,
      });
    } finally {
      if (requestId === activeRequestRef.current) {
        setLoading(false);
      }
    }
  };

  const handleVideoClick = async (videoId: string) => {
    const requestId = ++activeRequestRef.current;
    resetVideo();

    try {
      const data = await loadVideoData(videoId);
      if (requestId !== activeRequestRef.current) return;
      openGeneratedVideo(data);
      return;
    } catch (err: unknown) {
      if (requestId !== activeRequestRef.current) return;

      // Corrupted data gets its own warning. Missing data falls through silently to localStorage.
      if (!isNotFoundError(err)) {
        const message = err instanceof Error ? err.message : t('errors.home.corruptedData');
        showToast({
          tone: 'warning',
          title: t('common.error'),
          message,
        });
      }

      const saved = videoStore.get(videoId);
      if (saved?.segments) {
        setCurrentVideo({ videoId, segments: saved.segments });
        if (saved.sentences) setSentences(saved.sentences);
        if (saved.clozeExercises) setClozeExercises(saved.clozeExercises);
        if (saved.fsiDrills) setFsiDrills(saved.fsiDrills);
        historyStore.add(videoId, resolveKnownTitle(videoId, saved.title), saved.sentences?.length || 0);
        syncHistoryState();
        navigate(`/video/${videoId}`);
      } else {
        showToast({
          tone: 'error',
          title: t('common.error'),
          message: t('errors.home.openVideo'),
        });
      }
    }
  };

  const handleDeleteHistory = (videoId: string) => {
    historyStore.remove(videoId);
    syncHistoryState();
  };

  const availableIds = new Set(availableVideos.map((video: AvailableVideoSummary) => video.videoId));
  const historyOnly = history.filter((item: HistoryEntry) => !availableIds.has(item.videoId));

  return (
    <div className="mx-auto max-w-3xl">
      <HomeHero
        url={url}
        loading={loading}
        error={error}
        onUrlChange={setUrl}
        onAnalyze={handleAnalyze}
      />

      <HomeCliHint />
      <HomeFeatureGrid />
      <AvailableVideosSection
        videos={availableVideos}
        isLoading={isLoadingAvailableVideos}
        onVideoClick={handleVideoClick}
      />
      <RecentVideosSection
        videos={historyOnly}
        onVideoClick={handleVideoClick}
        onDeleteHistory={handleDeleteHistory}
      />
    </div>
  );
}
