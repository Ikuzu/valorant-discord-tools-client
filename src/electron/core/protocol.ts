import { app, BrowserWindow } from 'electron'
import path from 'path'
import { oauthHandler } from '../oauth/oauth-service'

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
    app.setAsDefaultProtocolClient(process.env.CUSTOM_URL_SCHEME, process.execPath, [
      path.resolve(process.argv[1]),
    ])
  } else {
    app.setAsDefaultProtocolClient(process.env.CUSTOM_URL_SCHEME)
  }
}

export function handleSecondInstance() {
  app.on('second-instance', async (_event, argv) => {
    if (!mainWindow) return

    const uri = argv.find((arg) => arg.startsWith(`${process.env.CUSTOM_URL_SCHEME}://`))
    if (!uri) return

    await oauthHandler(uri, mainWindow)
  })
}

export function handleInitialProtocolLaunch() {
  const uri = process.argv.find(
    (arg) => typeof arg === 'string' && arg.startsWith(`${process.env.CUSTOM_URL_SCHEME}://`)
  )
  if (!uri || !mainWindow) return

  const url = new URL(uri)
  const code = url.searchParams.get('code')
  if (!code) return

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow?.webContents.send('oauth-code', code)
  })
}
