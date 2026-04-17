import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer, { type VideoPlayerHandle } from '../components/VideoPlayer/VideoPlayer';
import { PracticeSession } from '../components/Practice/PracticeSession.jsx';
import { Button } from '../components/Common/Button.jsx';
import { useApp } from '../contexts/AppContext';
import { useLearning } from '../hooks/useLearning';
import { useVideoSync } from '../hooks/useVideoSync';
import { videoStore } from '../stores/videoStore';

export function PracticePage() {
  const params = useParams() as { videoId?: string };
  const videoId = params.videoId ?? '';
  const navigate = useNavigate();
  const playerRef = useRef(null as VideoPlayerHandle | null);
  const {
    sentences,
    setSentences,
    clozeExercises,
    setClozeExercises,
    fsiDrills,
    setFsiDrills,
  } = useApp();
  const { recordPractice, getProgress } = useLearning();
  const { currentTime } = useVideoSync(playerRef, []);
  const learningProgress = getProgress(videoId) ?? {};

  useEffect(() => {
    const saved = videoStore.get(videoId);
    if (saved?.sentences && !sentences?.length) setSentences(saved.sentences);
    if (saved?.clozeExercises && !clozeExercises?.length) setClozeExercises(saved.clozeExercises);
    if (saved?.fsiDrills && !fsiDrills?.length) setFsiDrills(saved.fsiDrills);
  }, [clozeExercises?.length, fsiDrills?.length, sentences?.length, setClozeExercises, setFsiDrills, setSentences, videoId]);

  const handleResult = (sentenceId: string, quality: number) => {
    recordPractice(videoId, sentenceId, quality);
  };

  const handlePlayAudio = (sentenceId: string) => {
    const sentence = sentences?.find((item) => item.id === sentenceId);
    if (!sentence) {
      console.warn(`Sentence not found for id: ${sentenceId}`);
      return;
    }
    if (typeof sentence.startTime !== 'number') return;
    playerRef.current?.seekTo(sentence.startTime);
    playerRef.current?.playVideo();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(`/video/${videoId}`)}
      >
        <ArrowLeft size={14} />
        Back to Video
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <VideoPlayer ref={playerRef} videoId={videoId} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <PracticeSession
            sentences={sentences}
            clozeExercises={clozeExercises}
            fsiDrills={fsiDrills}
            learningProgress={learningProgress}
            currentTime={currentTime}
            onResult={handleResult}
            onPlayAudio={handlePlayAudio}
            onComplete={() => navigate(`/video/${videoId}`)}
          />
        </div>
      </div>
    </div>
  );
}
