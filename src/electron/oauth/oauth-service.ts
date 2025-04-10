import { BrowserWindow } from 'electron'
import { exchangeCodeForToken, fetchDiscordUser } from './pkce'

let codeVerifier: string | null = null

export function setCodeVerifier(verifier: string) {
  codeVerifier = verifier
}

export async function oauthHandler(uri: string, window: BrowserWindow) {
  const url = new URL(uri)
  const code = url.searchParams.get('code')
  if (!code) return

  try {
    if (!codeVerifier) throw new Error('No codeVerifier stored')

    const accessToken = await exchangeCodeForToken(code, codeVerifier)
    codeVerifier = null

    const user = await fetchDiscordUser(accessToken)

    window.webContents.send('oauth-success', {
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatar,
    })
  } catch (err) {
    console.error('[OAuth Error]', err)
    window.webContents.send('oauth-failed')
  }
}
