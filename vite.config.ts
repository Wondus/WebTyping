import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

type ExtensionManifest = {
  background: Record<string, unknown>;
  browser_specific_settings?: unknown;
  [key: string]: unknown;
};

const manifestFor = (mode: string): ExtensionManifest => {
  const manifest = JSON.parse(readFileSync(resolve(projectRoot, 'manifest.json'), 'utf8')) as ExtensionManifest;

  if (mode === 'chromium') {
    manifest.background = { service_worker: 'background.js', type: 'module' };
    delete manifest.browser_specific_settings;
  } else {
    manifest.background = { scripts: ['background.js'], type: 'module' };
  }

  return manifest;
};

export default defineConfig(({ mode }) => ({
  root: projectRoot,
  plugins: [{
    name: 'webtyping-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: `${JSON.stringify(manifestFor(mode), null, 2)}\n`,
      });
    },
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
}));
