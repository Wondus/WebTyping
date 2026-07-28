import { storageGet, storageSet } from '../shared/browser-api';
import { migrateSettings } from './migration';
import type { Settings } from './settings-types';

const KEY = 'webtyping.settings';
export class SettingsStore {
  async load(): Promise<Settings> { return migrateSettings(await storageGet<unknown>(KEY)); }
  async save(settings: Settings): Promise<void> { await storageSet(KEY, migrateSettings(settings)); }
}
