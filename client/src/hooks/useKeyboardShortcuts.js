import { useEffect } from 'react';

export function useKeyboardShortcuts(playerRef, { onToggleLoop } = {}) {
  useEffect(() => {
    function handleKeyDown(e) {
      // Ignore when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const player = playerRef?.current;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (player) {
            player.getPlayerState?.() === 1
              ? player.pauseVideo?.()
              : player.playVideo?.();
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
