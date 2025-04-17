import { exchangeCodeForToken, fetchDiscordUser } from './pkce'
import { loadTokens, refreshAccessToken, saveTokens } from '../token-manager'
import { MainWindow } from '../../core/main-window'

let codeVerifier: string | null = null

export function setCodeVerifier(verifier: string) {
  codeVerifier = verifier
}

export async function oauthHandler(uri: string) {
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

    MainWindow.send('oauth-success', {
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatar,
    })
  } catch (err) {
    console.error('[OAuth Error]', err)
    MainWindow.send('oauth-failed')
  }
}

export async function tryAutoLogin(): Promise<boolean> {
  const tokens = await loadTokens()
  if (!tokens) return false

  if (tokens.expiresAt > Date.now()) {
    // accessTokenまだ有効
    const user = await fetchDiscordUser(tokens.accessToken)
    MainWindow.send('oauth-success', {
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
    MainWindow.send('oauth-success', {
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
