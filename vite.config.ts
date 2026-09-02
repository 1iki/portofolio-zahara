import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

// Load .env.local variables into process.env for Vite dev server
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'express-api-middleware',
        configureServer(server) {
          server.middlewares.use('/api', async (req, res, next) => {
            try {
              const { default: apiApp } = await import('./api/index.js');
              apiApp(req, res, next);
            } catch (err) {
              console.error('[API Middleware Error]', err);
              next(err);
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
