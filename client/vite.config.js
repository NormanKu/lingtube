import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('react-youtube')) return 'vendor-youtube';
          if (id.match(/[\\/](react|react-dom|scheduler)[\\/]/)) return 'vendor-react';
          return 'vendor';
        },
      },
    },
  },
});
