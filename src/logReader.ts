import axios from 'axios'
import { XmppMITM } from './riot/XmppMITM.js'

export async function startLogReadLoop(userId: string, xmppMitm: XmppMITM) {
  const pollInterval = 2000
  const seenMessageIds = new Set<string>()
  const startTime = new Date()
  let previousLength = 0

  const loop = async () => {
    try {
      const allMessages = xmppMitm.messages
      const newMessages = allMessages.slice(previousLength)
      previousLength = allMessages.length

      for (const raw of newMessages) {
        const stampMatch = raw.match(/stamp=['"]([^'"]+)['"]/)
        if (!stampMatch) continue

        const stamp = stampMatch[1]
        const msgTime = new Date(stamp)
        msgTime.setHours(msgTime.getHours() + 9)
        if (msgTime < startTime) continue

        const idMatch = raw.match(/id=['"]([^'"]+)['"]/)
        const messageId = idMatch?.[1]
        if (!messageId || seenMessageIds.has(messageId)) continue
        seenMessageIds.add(messageId)

        const fromMatch = raw.match(/from=['"]([^'"]+)['"]/)
        const toMatch = raw.match(/to=['"]([^'"]+)['"]/)
        const from = fromMatch?.[1] ?? ''
        const to = toMatch?.[1] ?? ''

        const bodyMatch = raw.match(/<body>(.*?)<\/body>/s)
        if (!bodyMatch) continue
        const content = bodyMatch[1]

        const postData = {
          messageId,
          discordUserId: userId,
          room: '',
          from,
          to,
          timestamp: msgTime.toISOString(),
          content
        }

        console.log('[SEND TO SERVER]', postData)

        await axios.post(
          'https://valorant-discord-tools-server-production.up.railway.app/message',
          postData
        )
      }
    } catch (err) {
      console.error('[VOICE LOOP ERROR]', err)
    }
  }

  setInterval(loop, pollInterval)
}
