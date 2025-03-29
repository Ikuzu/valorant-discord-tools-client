import { Client, GatewayIntentBits, REST, Routes, Interaction } from 'discord.js'
import dotenv from 'dotenv'
import { handleStartCommand } from './commands/start.js'
import { fetchVoicevoxSpeakers } from './voicevox.js'
import { VoicevoxSpeaker } from './types/voicevox.js'
import { voiceSettingsMap } from './settings.js'

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
        description: 'VC channel name',
        type: 3, // String
        required: true,
        autocomplete: true // ←追加！
      }
    ]
  },
  {
    name: 'mute',
    description: 'Toggle voice reading on/off'
  },
  {
    name: 'volume',
    description: 'Set voice volume (0-100)',
    options: [
      {
        name: 'level',
        description: 'Volume level',
        type: 4, // Integer
        required: true,
        min_value: 0,
        max_value: 100
      }
    ]
  },
  {
    name: 'speaker',
    description: 'Select VOICEVOX speaker',
    options: [
      {
        name: 'name',
        description: 'Speaker name',
        type: 3, // String
        required: true,
        autocomplete: true
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
    case 'mute': {
      const guildId = interaction.guildId!
      const settings = voiceSettingsMap.get(guildId) ?? {
        isMuted: false,
        volume: 100,
        speakerId: 0
      }

      settings.isMuted = !settings.isMuted
      voiceSettingsMap.set(guildId, settings)

      await interaction.reply({
        content: `🔇 読み上げを ${settings.isMuted ? 'ミュート' : 'アンミュート'} にしました。`,
        ephemeral: true
      })
      break
    }
    case 'volume': {
      const guildId = interaction.guildId!
      const level = interaction.options.getInteger('level', true)
      const settings = voiceSettingsMap.get(guildId) ?? {
        isMuted: false,
        volume: 100,
        speakerId: 0
      }

      settings.volume = level
      voiceSettingsMap.set(guildId, settings)

      await interaction.reply({
        content: `🔊 音量を ${level}% に設定しました。`,
        ephemeral: true
      })
      break
    }
    case 'speaker': {
      const guildId = interaction.guildId!
      const speakerId = parseInt(interaction.options.getString('name', true), 10)
      const settings = voiceSettingsMap.get(guildId) ?? {
        isMuted: false,
        volume: 100,
        speakerId: 0
      }

      settings.speakerId = speakerId
      voiceSettingsMap.set(guildId, settings)

      await interaction.reply({
        content: `🎤 話者をID ${speakerId} に変更しました。`,
        ephemeral: true
      })
      break
    }
  }
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.isAutocomplete()) {
    const commandName = interaction.commandName
    const focused = interaction.options.getFocused()

    // `/speaker` の補完処理
    if (commandName === 'speaker') {
      const speakers: VoicevoxSpeaker[] = await fetchVoicevoxSpeakers()
      const filtered = speakers
        .filter((speaker) => speaker.name.toLowerCase().includes(focused.toLowerCase()))
        .slice(0, 25)
        .map((speaker) => ({
          name: speaker.name,
          value: speaker.styles[0].id.toString()
        }))
      await interaction.respond(filtered)
      return
    }

    // `/start` の VCチャンネル名補完
    if (commandName === 'start') {
      const guild = interaction.guild
      if (!guild) return

      await guild.channels.fetch() // Ensure channels are cached
      const voiceChannels = Array.from(
        guild.channels.cache
          .filter(
            (ch) => ch.isVoiceBased() && ch.name.toLowerCase().includes(focused.toLowerCase())
          )
          .map((ch) => ({ name: ch.name, value: ch.id }))
      ).slice(0, 25)

      await interaction.respond(voiceChannels)
      return
    }
  }
})

client.login(process.env.DISCORD_TOKEN)
