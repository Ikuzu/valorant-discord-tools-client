import { ipcMain } from 'electron'
import { startValorant } from '../../riot/riot-manager'

ipcMain.handle('start-valorant', async (_event, { guildId, discordUserId }) => {
  console.log('start-valorant called with:', guildId, discordUserId)

  return await startValorant(guildId, discordUserId)
})
