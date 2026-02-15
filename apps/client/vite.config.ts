import tailwindcss from '@tailwindcss/vite';
import TanStackRouterVite from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { prerender } from './vite-plugin-prerender';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    prerender({
      routes: ['/about'],
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
