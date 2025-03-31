import { RiotManager } from './riot/riotManager.js'
import { startLogReadLoop } from './logReader.js'
import { getUserIdViaOAuth } from './oauth-server.js'

const riotManager = new RiotManager()

// OAuth2で人間のユーザーIDを取得
const userId = await getUserIdViaOAuth()
console.log('[OAUTH USER ID]', userId)

await riotManager.start()
const xmppMitm = await riotManager.getXmppMitm()
if (xmppMitm) {
  await startLogReadLoop(userId, xmppMitm) // 👈 userIdを渡す！
}
