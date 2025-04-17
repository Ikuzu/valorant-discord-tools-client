import { ipcMain } from 'electron'
import { setCodeVerifier, tryAutoLogin } from '../../discord/oauth/oauth-service'
import { startDiscordOAuthWithPKCE } from '../../discord/oauth/pkce'

ipcMain.handle('start-discord-oauth', async (_event) => {
  if (!(await tryAutoLogin())) {
    // PKCE OAuth を開始 → 非同期で実行
    void (async () => {
      const codeVerifier = await startDiscordOAuthWithPKCE()
      setCodeVerifier(codeVerifier)
    })()

    return { status: 'browser-oauth' }
  }
  return { status: 'auto-login' }
})
