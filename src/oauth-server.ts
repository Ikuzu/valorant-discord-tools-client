// oauth.ts
import express from 'express'
import axios from 'axios'
import qs from 'querystring'
import open from 'open'

const CLIENT_ID = '1354786065101230272'
const CLIENT_SECRET = 'N4MBt7NrOTbcK9VVjq--yV1KMRWtrWxo'
const REDIRECT_URI = 'http://localhost:3001/callback'

export async function getUserIdViaOAuth(): Promise<string> {
  const app = express()

  let resolveUserId: (id: string) => void
  const userIdPromise = new Promise<string>((resolve) => {
    resolveUserId = resolve
  })

  app.get('/callback', async (req, res) => {
    const code = req.query.code as string
    if (!code) {
      res.status(400).send('コードがありません')
      return
    }

    try {
      const tokenRes = await axios.post(
        'https://discord.com/api/oauth2/token',
        qs.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          scope: 'identify'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      const accessToken = tokenRes.data.access_token

      const userRes = await axios.get('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      const user = userRes.data
      console.log('OAuth取得成功 - userId:', user.id)

      res.send(`<h1>ログイン完了！</h1><p>User ID: ${user.id}</p>`)
      resolveUserId(user.id)
      server.close()
    } catch (err) {
      console.error('[OAuth Error]', err)
      res.status(500).send('OAuth失敗')
    }
  })

  const server = app.listen(3001, () => {
    console.log(`OAuthサーバー起動: http://localhost:3001`)
  })

  const authUrl = new URL('https://discord.com/oauth2/authorize')
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'identify')

  await open(authUrl.toString())
  return userIdPromise
}
