import { RiotManager } from './riot/riotManager.js'
import { startLogReadLoop } from './logReader.js'
import { getUserIdViaOAuth } from './oauth-server.js'
import readline from 'node:readline/promises'
import axios from 'axios'

const riotManager = new RiotManager()
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const discordUserId = await getUserIdViaOAuth()
console.log('OAuth user ID:', discordUserId)

let guilds: { guildId: string; guildName: string }[]
try {
  const response = await axios.get(
    'https://valorant-discord-tools-server-production.up.railway.app/user-guild',
    {
      params: { discordUserId }
    }
  )
  guilds = response.data
} catch (error) {
  console.error('Failed to fetch guilds')
  process.exit(1)
}

if (guilds.length === 0) {
  console.error('No available guilds found for this user')
  process.exit(1)
}

console.log('\nAvailable guilds:')
guilds.forEach((g, i) => {
  console.log(`${i + 1}: ${g.guildName} (${g.guildId})`)
})

const indexStr = await rl.question('\nSelect a guild by number: ')
const selectedIndex = parseInt(indexStr, 10) - 1
const selectedGuild = guilds[selectedIndex]
if (!selectedGuild) {
  console.error('Invalid selection')
  process.exit(1)
}

console.log('Selected guild:', selectedGuild.guildName)

// Start XMPP and log reader
await riotManager.start()
const xmppMitm = await riotManager.getXmppMitm()
if (xmppMitm) {
  await startLogReadLoop(selectedGuild.guildId, discordUserId, xmppMitm)
}
