# Firefox reviewer build instructions

WebTyping 1.5.0 is built from TypeScript with Vite. It has no runtime network dependencies, generated code, or environment-variable requirements.

## Environment

- Node.js 20 or newer (Mozilla's default Node.js 24 environment is supported)
- pnpm 11.9.0

## Build

From the source archive root:

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile
pnpm run build:firefox
```

The reviewable extension is written to `dist/`. Its top-level files are `manifest.json`, `background.js`, `content.js`, and the `icons/` directory.

The Firefox build uses `background.scripts` and retains `browser_specific_settings`, including the required no-data-collection declaration. The Chromium-only build is not needed for Mozilla review.
