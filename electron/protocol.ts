// electron/protocol.ts
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { exchangeCodeForToken, fetchDiscordUser } from './oauth-pkce'

let mainWindow: BrowserWindow | null = null
let codeVerifier: string | null = null // PKCE用

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win
}

export function setCodeVerifier(verifier: string) {
  codeVerifier = verifier
}

/** URIスキームを OS に登録 */
export function registerCustomProtocol() {
  if (process.defaultApp) {
    app.setAsDefaultProtocolClient('valorantDiscordTools', process.execPath, [
      path.resolve(process.argv[1]),
    ])
  } else {
    app.setAsDefaultProtocolClient('valorantDiscordTools')
  }
}

/** "second-instance" イベントを一括管理。ここで code→トークン交換→renderer送信 までやる */
export function handleSecondInstance() {
  app.on('second-instance', async (_event, argv) => {
    if (!mainWindow) return

    // カスタムスキームのURI (valorantDiscordTools://callback?code=xxx) を探す
    const uri = argv.find(
      (arg) => typeof arg === 'string' && arg.startsWith('valorantdiscordtools://')
    )
    if (!uri) return

    const url = new URL(uri)
    const code = url.searchParams.get('code')
    if (!code) return

    console.log('OAuth code received in main:', code)

    try {
      if (!codeVerifier) throw new Error('No codeVerifier stored')

      // トークン取得
      const accessToken = await exchangeCodeForToken(code, codeVerifier)
      codeVerifier = null

      // ユーザー情報取得
      const user = await fetchDiscordUser(accessToken)
      // user = { id, username, avatar, discriminator, ... }

      // 必要な要素だけ送信
      mainWindow.webContents.send('oauth-success', {
        userId: user.id,
        userName: user.username,
        userAvatar: user.avatar,
      })
    } catch (err) {
      console.error('[OAuth Error]', err)
      mainWindow.webContents.send('oauth-failed')
    }
  })
}

/** 初回起動(すでにURI付きで起動された)の場合にも対応したいなら */
export function handleInitialProtocolLaunch() {
  const uri = process.argv.find(
    (arg) => typeof arg === 'string' && arg.startsWith('valorantdiscordtools://')
  )
  if (!uri || !mainWindow) return

  const url = new URL(uri)
  const code = url.searchParams.get('code')
  if (!code) return

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow?.webContents.send('oauth-code', code)
  })
}
