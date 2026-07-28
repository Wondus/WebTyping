import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [{
    name: 'webtyping-manifest',
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'manifest.json', source: readFileSync(resolve(projectRoot, 'manifest.json'), 'utf8') }); },
  }],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(projectRoot, 'src/background/service-worker.ts'),
        content: resolve(projectRoot, 'src/content/index.ts'),
      },
      output: { entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js' },
    },
  },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
