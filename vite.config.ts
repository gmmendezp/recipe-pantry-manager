/// <reference types="vitest" />

import netlify from '@netlify/vite-plugin-tanstack-start';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    strictPort: true,
  },
  test: {
    setupFiles: ['./tests/unit/setup.ts'],
  },
  plugins: [devtools(), netlify(), tailwindcss(), tanstackStart(), viteReact()],
});

export default config;
