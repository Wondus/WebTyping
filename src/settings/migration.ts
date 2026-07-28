import { DEFAULT_SETTINGS } from './defaults';
import type { Settings } from './settings-types';

export function migrateSettings(value: unknown): Settings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_SETTINGS };
  const source = value as Partial<Settings>;
  const legacy = value as { version?: unknown; requirePunctuation?: unknown };
  const sourceVersion = typeof legacy.version === 'number' ? legacy.version : 0;
  return {
    version: 6,
    segmentWords: clampNumber(source.segmentWords, 1, 50, 10),
    idleSeconds: clampNumber(source.idleSeconds, 1, 10, 3),
    highlightedNextWords: sourceVersion < 6 ? 0 : clampNumber(source.highlightedNextWords, 0, 5, 0),
    caseSensitive: booleanValue(source.caseSensitive, true),
    skipEmojis: sourceVersion < 4 ? true : booleanValue(source.skipEmojis, true),
    skipPunctuation: booleanValue(source.skipPunctuation, legacy.requirePunctuation === false),
    fontSize: clampNumber(source.fontSize, 16, 48, 26),
    columnWidth: clampNumber(source.columnWidth, 560, 1100, 840),
  };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}
