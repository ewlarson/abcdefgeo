import path from 'node:path';
import fs from 'node:fs/promises';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin, ResolvedConfig } from 'vite';
import react from '@vitejs/plugin-react';

function githubPagesSpaFallback(): Plugin {
  let outDir = '';

  return {
    name: 'github-pages-spa-fallback',
    apply: 'build' as const,
    configResolved(config: ResolvedConfig) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await Promise.all(
        ['404.html', '500.html'].map((fileName) =>
          fs.copyFile(
            path.join(outDir, 'index.html'),
            path.join(outDir, fileName)
          )
        )
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE_URL || '/',
    plugins: [react(), githubPagesSpaFallback()],
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
        'void-elements': path.resolve(__dirname, 'src/shims/void-elements.ts'),
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
