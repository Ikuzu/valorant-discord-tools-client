import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { config } from 'dotenv'
import {
  registerCustomProtocol,
  handleSecondInstance,
  handleInitialProtocolLaunch,
  setMainWindow,
  setCodeVerifier,
} from './protocol'
import { startDiscordOAuthWithPKCE } from './oauth-pkce'
import { RiotManager } from './riot/riotManager'
import { startLogReadLoop } from './logReader'
import { exec } from 'child_process'

// .env 読み込み
config({ path: path.join(__dirname, '../.env') })

// 開発モード判定
const isDev = process.env.NODE_ENV === 'development'

// ビルド済み Renderer のパス
const RENDERER_DIST = path.join(__dirname, '../renderer')
const riotManager = new RiotManager()

// カスタムプロトコル（valorantDiscordTools://...）登録
registerCustomProtocol()

// 多重起動を防ぐ
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.whenReady().then(async () => {
    const win = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.cjs'),
      },
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

    // アプリ起動と同時に PKCE OAuth を開始 → codeVerifier を保持
    const codeVerifier = await startDiscordOAuthWithPKCE()
    setCodeVerifier(codeVerifier)
  })

  // second-instance は protocol.ts 側で一元管理
  handleSecondInstance()
}

// ---- ここから下は IPC ハンドラなど ----

// サーバーURL（ギルド一覧取得用）
const GUILD_API_URL = 'https://valorant-discord-tools-server-production.up.railway.app/user-guild'

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
    const axios = require('axios')
    const { data } = await axios.get(GUILD_API_URL, {
      params: { discordUserId },
    })
    return data // [{ guildId, guildName }, ...]
  } catch (err) {
    console.error('fetch-guilds error:', err)
    return []
  }
})

ipcMain.handle('start-discord-oauth', async (_event) => {
  const codeVerifier = await startDiscordOAuthWithPKCE()
  setCodeVerifier(codeVerifier)
  return { success: true }
})

ipcMain.handle('start-valorant', async (_event, { guildId, discordUserId }) => {
  console.log('start-valorant called with:', guildId, discordUserId)

  // 1) すでに Riot/Valorant が起動中か確認
  const running = await isRiotOrValorantRunning()
  if (running) {
    // 2) ダイアログで確認
    const result = dialog.showMessageBoxSync({
      type: 'question',
      title: 'Riot/Valorantが起動中です',
      message: 'Riot Client または Valorant がすでに起動しています。終了しますか？',
      buttons: ['OK', 'キャンセル'],
      cancelId: 1, // "キャンセル"が押されたら1
      defaultId: 0, // デフォルトは OK
    })
    // OK が押されたら result = 0
    if (result === 0) {
      // 3) 強制終了
      await killRiotAndValorant()
    } else {
      // キャンセルされた場合は何もしないでリターン
      return { success: false, error: 'User canceled' }
    }
  }

  try {
    // 4) ここで改めて Valorant を MITM 付きで起動
    await riotManager.start()
    const xmppMitm = riotManager.getXmppMitm()
    if (xmppMitm) {
      await startLogReadLoop(guildId, discordUserId, xmppMitm)
    }
    return { success: true }
  } catch (err) {
    console.error('start-valorant error:', err)
    return { success: false, error: err }
  }
})
