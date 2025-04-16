import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import {
  registerCustomProtocol,
  handleSecondInstance,
  handleInitialProtocolLaunch,
  setMainWindow,
} from './core/protocol'
import { startDiscordOAuthWithPKCE } from './discord/oauth/pkce'
import { RiotMitmService } from './riot/riot-mitm-service'
import { exec } from 'child_process'
import { setCodeVerifier, tryAutoLogin } from './discord/oauth/oauth-service'
import axios from 'axios'

// .env 読み込み
const env = config({ path: path.join(__dirname, '.env') })
expand(env)
let win: BrowserWindow | null = null
// 開発モード判定
const isDev = process.env.NODE_ENV === 'development'

// ビルド済み Renderer のパス
const RENDERER_DIST = path.join(__dirname, '../renderer')
const riotMitmService = new RiotMitmService()

// カスタムプロトコル登録
registerCustomProtocol()

// 多重起動を防ぐ
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.whenReady().then(async () => {
    win = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.cjs'),
      },
      minHeight: 400,
      minWidth: 400,
    })
    win.setMenuBarVisibility(false)

    // 他モジュールにウィンドウ参照を渡しておく
    setMainWindow(win)

    // 開発 or 本番 で読み込む先を変える
    if (isDev) {
      await win.loadURL('http://localhost:5173')
    } else {
      await win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }

    // 起動時のカスタムスキームURI処理（初回起動分）
    handleInitialProtocolLaunch()
  })

  // second-instance は protocol.ts 側で一元管理
  handleSecondInstance()
}

// サーバーURL（ギルド一覧取得用）
const GUILD_API_URL = `${process.env.API_BASE_URL}/user-guild`
const PING_API_URL = `${process.env.API_BASE_URL}/ping`

// Riot/Valorant が起動しているかを tasklist で判定
async function isRiotOrValorantRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('tasklist', (err, stdout) => {
      if (err) {
        console.error('Failed to run tasklist:', err)
        return resolve(false)
      }
      const isRiotRunning = stdout.includes('RiotClientServices.exe')
      const isValorantRunning = stdout.includes('VALORANT-Win64-Shipping.exe')
      resolve(isRiotRunning || isValorantRunning)
    })
  })
}

// Riot/Valorant を強制終了
async function killRiotAndValorant() {
  return new Promise<void>((resolve) => {
    let doneCount = 0
    const onFinish = (err: Error | null) => {
      if (err) {
        console.warn('[kill] エラー:', err.message)
      }
      doneCount++
      if (doneCount >= 2) {
        resolve()
      }
    }

    // Riot Client
    exec('taskkill /F /IM RiotClientServices.exe', onFinish)
    // Valorant
    exec('taskkill /F /IM VALORANT-Win64-Shipping.exe', onFinish)
  })
}

// 例: DiscordユーザーIDや名前をフロント → メインに再送させる方式の場合
ipcMain.handle('fetch-guilds', async (_event, { discordUserId }) => {
  try {
    const { data } = await axios.get(GUILD_API_URL, {
      params: { discordUserId },
    })
    return data // [{ guildId, guildName }, ...]
  } catch (err) {
    console.error('fetch-guilds error:', err)
    return []
  }
})

ipcMain.handle('ping', async () => {
  try {
    await axios.get(PING_API_URL)
    return true
  } catch (error) {
    console.error('Ping failed:', error)
    return false
  }
})

ipcMain.handle('start-discord-oauth', async (_event) => {
  if (win) {
    if (!(await tryAutoLogin(win))) {
      // PKCE OAuth を開始 → 非同期で実行
      void (async () => {
        const codeVerifier = await startDiscordOAuthWithPKCE()
        setCodeVerifier(codeVerifier)
      })()

      return { status: 'browser-oauth' }
    }
    return { status: 'auto-login' }
  }
  return { status: 'no-window' }
})

ipcMain.handle('start-valorant', async (_event, { guildId, discordUserId }) => {
  console.log('start-valorant called with:', guildId, discordUserId)

  // Riot/Valorant が起動中か確認
  const running = await isRiotOrValorantRunning()
  if (running) {
    // 起動中であればダイアログで確認
    const result = dialog.showMessageBoxSync({
      type: 'question',
      title: 'Riot/Valorantが起動中です',
      message: 'Riot Client または Valorant がすでに起動しています。終了しますか？',
      buttons: ['OK', 'キャンセル'],
      cancelId: 1,
      defaultId: 0,
    })
    if (result === 0) {
      await killRiotAndValorant()
    } else {
      return { status: 'failed' }
    }
  }

  try {
    // Valorant を MITM 付きで起動
    await riotMitmService.start(guildId, discordUserId)
    return { status: 'started' }
  } catch (err) {
    console.error('start-valorant error:', err)
    return { status: 'failed' }
  }
})
