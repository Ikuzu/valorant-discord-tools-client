import { ipcMain } from 'electron'
import { getSettings, updateSettings } from '../../store/settings-store'

ipcMain.handle('update-settings', (_event, partialSettings) => {
  updateSettings(partialSettings)
})

ipcMain.handle('get-settings', () => {
  return getSettings()
})
