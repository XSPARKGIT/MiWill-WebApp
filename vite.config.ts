import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {portalLeadsAdminPlugin} from './vite/portalLeadsAdminPlugin.mjs';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, path.resolve(__dirname), '');
  const portalProjectId = env.VITE_FIREBASE_PROJECT_ID ?? 'miwill-dev';
  const devPlugins =
    mode === 'production'
      ? []
      : [portalLeadsAdminPlugin(portalProjectId)];

  return {
    envDir: path.resolve(__dirname),
    plugins: [react(), tailwindcss(), ...devPlugins],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  };
});
