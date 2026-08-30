import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('pdf-lib')) return 'pdf-vendor';
            if (id.includes('lucide-react') || id.includes('/icons/')) return 'icons-vendor';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'maps-vendor';
            if (id.includes('recharts') || id.includes('d3-')) return 'charts-vendor';
            if (id.includes('framer-motion') || id.includes('motion')) return 'motion-vendor';
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('@tanstack') || id.includes('axios') || id.includes('react-router')) return 'core-vendor';
            if (id.includes('react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react-vendor';
            return 'vendor';
          },
        },
      },
    },
  };
});
