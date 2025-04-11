import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import axios from 'axios'

const tokenPath = path.join(app.getPath('userData'), 'tokens.json')

interface Tokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export async function loadTokens(): Promise<Tokens | null> {
  try {
    const raw = await fs.readFile(tokenPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function saveTokens(tokens: Tokens) {
  await fs.writeFile(tokenPath, JSON.stringify(tokens), { mode: 0o600 })
}

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID!,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const res = await axios.post('https://discord.com/api/oauth2/token', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  return {
    accessToken: res.data.access_token,
    refreshToken: res.data.refresh_token,
    expiresAt: Date.now() + res.data.expires_in * 1000,
  }
}
