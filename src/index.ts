import { Client, GatewayIntentBits, REST, Routes, Interaction } from 'discord.js'
import dotenv from 'dotenv'
import { handleStartCommand } from './commands/start.js'

dotenv.config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
})

const commands = [
  {
    name: 'start',
    description: 'join vc',
    options: [
      {
        name: 'channel',
        description: 'vc channelName or Id',
        type: 3,
        required: true
      }
    ]
  }
]

const guildIds = process.env.GUILD_IDS?.split(',') || []

async function registerSlashCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN as string)

  console.log('コマンドの登録を開始')
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands })

  for (const guildId of guildIds) {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId), {
      body: commands
    })
    console.log(`コマンドの登録が完了 サーバー: ${guildId}`)
  }
}

client.once('ready', async () => {
  console.log(`準備完了 タグ：${client.user?.tag}`)
  await registerSlashCommands()
})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = interaction.commandName

  switch (command) {
    case 'start':
      await handleStartCommand(interaction)
      break
  }
})

client.login(process.env.DISCORD_TOKEN)
