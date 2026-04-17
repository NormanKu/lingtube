import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _ReactAlias = typeof React;
import YouTube from 'react-youtube';
type YouTubeEvent = { target: any };
type YouTubePlayer = {
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  getPlayerState: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
};

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  getPlayerState: () => number | undefined;
  playVideo: () => void;
  pauseVideo: () => void;
}

export type VideoPlayerProps = {
  videoId: string;
  onReady?: (event: YouTubeEvent) => void;
  onStateChange?: (event: YouTubeEvent) => void;
};

const VideoPlayer = forwardRef(function VideoPlayer(
  { videoId, onReady, onStateChange }: VideoPlayerProps,
  ref: any
) {
  const playerRef = useRef(null as YouTubePlayer | null);

  useImperativeHandle(ref, () => ({
    seekTo(seconds: number) {
      playerRef.current?.seekTo(seconds, true);
    },
    getCurrentTime() {
      return playerRef.current?.getCurrentTime() ?? 0;
    },
    setPlaybackRate(rate: number) {
      playerRef.current?.setPlaybackRate(rate);
    },
    getPlaybackRate() {
      return playerRef.current?.getPlaybackRate() ?? 1;
    },
    getPlayerState() {
      return playerRef.current?.getPlayerState();
    },
    playVideo() {
      playerRef.current?.playVideo();
    },
    pauseVideo() {
      playerRef.current?.pauseVideo();
    },
  }));

  const handleReady = useCallback((event: YouTubeEvent) => {
    playerRef.current = event.target;
    onReady?.(event);
  }, [onReady]);

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onStateChange={onStateChange}
        className="h-full w-full"
        iframeClassName="h-full w-full"
      />
    </div>
  );
});

export default VideoPlayer;
