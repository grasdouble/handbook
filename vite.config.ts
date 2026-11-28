import { readFileSync } from 'node:fs';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { publicPaths } from './site.mjs';

export default defineConfig(({ command }) => ({
  plugins: [
    tanstackStart({
      prerender: {
        enabled: command === 'build',
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
      pages:
        command === 'build'
          ? publicPaths(JSON.parse(readFileSync('src/generated/library.json', 'utf8'))).map(
              (path: string) => ({ path }),
            )
          : [],
    }),
    react(),
  ],
}));
