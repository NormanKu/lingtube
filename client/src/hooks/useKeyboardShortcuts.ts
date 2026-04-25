import { useEffect } from 'react';
import type { VideoPlayerHandle } from '../components/VideoPlayer/VideoPlayer';

interface KeyboardShortcutOptions {
  onToggleLoop?: () => void;
}

type PlayerRef = { current: VideoPlayerHandle | null } | null | undefined;

export function useKeyboardShortcuts(
  playerRef: PlayerRef,
  { onToggleLoop }: KeyboardShortcutOptions = {}
): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept browser/OS shortcuts (Cmd+L, Ctrl+R, Alt+Left, ...).
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Don't fire while the user is typing in any editable surface.
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) return;

      const player = playerRef?.current;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (player) {
            if (player.getPlayerState?.() === 1) {
              player.pauseVideo?.();
            } else {
              player.playVideo?.();
            }
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (player) {
            const t = player.getCurrentTime?.() || 0;
            player.seekTo(Math.max(0, t - 5));
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (player) {
            const t = player.getCurrentTime?.() || 0;
            player.seekTo(t + 5);
          }
          break;
        case '[':
          if (player) {
            const rate = player.getPlaybackRate?.() || 1;
            player.setPlaybackRate(Math.max(0.25, rate - 0.25));
          }
          break;
        case ']':
          if (player) {
            const rate = player.getPlaybackRate?.() || 1;
            player.setPlaybackRate(Math.min(2, rate + 0.25));
          }
          break;
        case 'l':
        case 'L':
          onToggleLoop?.();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerRef, onToggleLoop]);
}
