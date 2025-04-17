import Store from 'electron-store'

const defaults: AppSettings = {
  volume: 80,
  ttsEngine: 'default',
  speakerId: '',
  styleId: '',
}

export const settingsStore = new Store<AppSettings>({
  name: 'settings', // configファイル名（settings.json）
  defaults,
})

export function getSettings(): AppSettings {
  return settingsStore.store
}

export function updateSettings(partial: Partial<AppSettings>): void {
  settingsStore.set(partial)
}
