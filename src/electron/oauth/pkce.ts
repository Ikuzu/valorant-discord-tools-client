// electron/oauth-pkce.ts
import crypto from 'crypto'
import open from 'open'
import axios from 'axios'

// .env や main.ts 側で読み込んでいる前提

function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32))
}

function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  return base64URLEncode(hash)
}

function base64URLEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function startDiscordOAuthWithPKCE() {
  // 1) code_verifier & code_challenge 生成
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)

  // 2) Discord 認証URL
  const authUrl = new URL('https://discord.com/oauth2/authorize')
  authUrl.searchParams.set('client_id', process.env.OAUTH_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', process.env.OAUTH_REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'identify')
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')

  // 3) ブラウザで開く
  await open(authUrl.toString())

  return codeVerifier
}

export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<string> {
  const body = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    code_verifier: codeVerifier,
  })

  const res = await axios.post('https://discord.com/api/oauth2/token', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.data.access_token
}

// ユーザー情報の型(必要な要素だけ)
interface DiscordUser {
  id: string
  username: string
  avatar: string | null
  discriminator: string
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const userRes = await axios.get('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return userRes.data
}
