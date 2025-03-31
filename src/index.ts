import { RiotManager } from './riot/riotManager.js'
import { startLogReadLoop } from './logReader.js'
import { getUserIdViaOAuth } from './oauth-server.js'

const riotManager = new RiotManager()

const userId = await getUserIdViaOAuth()
console.log('[OAUTH USER ID]', userId)

await riotManager.start()
const xmppMitm = await riotManager.getXmppMitm()
if (xmppMitm) {
  await startLogReadLoop(userId, xmppMitm)
}
