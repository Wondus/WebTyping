import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/settings/defaults';
import { migrateSettings } from '../src/settings/migration';

describe('settings migration', () => {
  it('enables emoji skipping for defaults', () => {
    expect(DEFAULT_SETTINGS.skipEmojis).toBe(true);
    expect(DEFAULT_SETTINGS.skipPunctuation).toBe(false);
    expect(DEFAULT_SETTINGS.highlightedNextWords).toBe(0);
  });

  it('removes retired settings and upgrades older emoji defaults', () => {
    const migrated = migrateSettings({ version: 3, highlightedNextWords: 2, skipEmojis: false, requirePunctuation: true, strictMode: true, smoothCaret: false, theme: 'light', autoScroll: false, showAccuracy: false });
    expect(migrated).toMatchObject({ version: 6, highlightedNextWords: 0, skipEmojis: true, skipPunctuation: false });
    expect(migrated).not.toHaveProperty('theme');
    expect(migrated).not.toHaveProperty('autoScroll');
    expect(migrated).not.toHaveProperty('showAccuracy');
    expect(migrated).not.toHaveProperty('strictMode');
    expect(migrated).not.toHaveProperty('smoothCaret');
  });

  it('preserves explicit version 4 choices', () => {
    expect(migrateSettings({ version: 6, highlightedNextWords: 3, skipEmojis: false, skipPunctuation: true })).toMatchObject({ highlightedNextWords: 3, skipEmojis: false, skipPunctuation: true });
  });
});
