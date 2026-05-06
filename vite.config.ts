import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE_URL || '/',
    plugins: [react()],
    server: {
      port: 3000,
      allowedHosts: ['btaa-geoportal.ngrok.io'],
    },
    resolve: {
      alias: {
        geoblacklight: path.resolve(
          __dirname,
          'node_modules/@geoblacklight/frontend/app/javascript/geoblacklight'
        ),
        'void-elements': path.resolve(
          __dirname,
          'src/shims/void-elements.ts'
        ),
      },
      dedupe: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
    },
    optimizeDeps: {
      exclude: [
        'lucide-react',
        '@geoblacklight/frontend',
        'geoblacklight/controllers/leaflet_viewer_controller',
        'geoblacklight/controllers/openlayers_viewer_controller',
        'geoblacklight/controllers/oembed_viewer_controller',
        'geoblacklight/controllers/search_results_controller',
        'geoblacklight/controllers/downloads_controller',
        'geoblacklight/controllers/clipboard_controller',
      ],
      include: ['react-helmet-async', 'h3-js'],
    },
  };
});
