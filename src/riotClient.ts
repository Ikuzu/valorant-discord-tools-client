import fs from 'fs'
import path from 'path'
import axios from 'axios'
import https from 'https'

const lockfilePath = path.join(
  process.env.LOCALAPPDATA || '',
  'Riot Games',
  'Riot Client',
  'Config',
  'lockfile'
)

const seenMessages = new Set<string>()

function getLockfileInfo() {
  const content = fs.readFileSync(lockfilePath, 'utf-8')
  const [name, pid, port, password, protocol] = content.split(':')
  return { port, password, protocol }
}

function createAuthHeader(password: string) {
  return `Basic ${Buffer.from(`riot:${password}`).toString('base64')}`
}

export async function fetchChatMessages(): Promise<{ sender: string; content: string }[]> {
  const { port, password, protocol } = getLockfileInfo()
  const auth = createAuthHeader(password)
  const agent = new https.Agent({ rejectUnauthorized: false })

  const res = await axios.get(`${protocol}://127.0.0.1:${port}/chat/v6/conversations`, {
    httpsAgent: agent,
    headers: { Authorization: auth }
  })

  const results: { sender: string; content: string }[] = []

  for (const convo of res.data.conversations) {
    const cid = convo.cid
    const msgRes = await axios.get(`${protocol}://127.0.0.1:${port}/chat/v6/messages/${cid}`, {
      httpsAgent: agent,
      headers: { Authorization: auth }
    })

    for (const msg of msgRes.data.messages || []) {
      if (!seenMessages.has(msg.id)) {
        seenMessages.add(msg.id)
        results.push({ sender: msg.from.name, content: msg.body })
      }
    }
  }

  return results
}
