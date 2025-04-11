import { BrowserWindow } from 'electron'
import { exchangeCodeForToken, fetchDiscordUser } from './pkce'
import { loadTokens, refreshAccessToken, saveTokens } from '../token-manager'

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

    const { accessToken, refreshToken, expiresAt } = await exchangeCodeForToken(code, codeVerifier)
    codeVerifier = null

    // 認証ユーザー取得
    const user = await fetchDiscordUser(accessToken)

    // ローカルにトークン保存
    await saveTokens({
      accessToken,
      refreshToken,
      expiresAt,
    })

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

export async function tryAutoLogin(window: BrowserWindow): Promise<boolean> {
  const tokens = await loadTokens()
  if (!tokens) return false

  if (tokens.expiresAt > Date.now()) {
    // accessTokenまだ有効
    const user = await fetchDiscordUser(tokens.accessToken)
    window.webContents.send('oauth-success', {
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatar,
    })
    return true
  }

  try {
    const { accessToken, refreshToken, expiresAt } = await refreshAccessToken(tokens.refreshToken)
    await saveTokens({
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresAt * 1000,
    })

    const user = await fetchDiscordUser(accessToken)
    window.webContents.send('oauth-success', {
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatar,
    })

    return true
  } catch (e) {
    console.error('[AutoLogin Failed]', e)
    return false
  }
}
