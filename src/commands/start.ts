// handler.ts
import { ChatInputCommandInteraction, ChannelType } from 'discord.js'
import { startVoiceReadLoop } from '../voiceReader.js' // 音声合成とVC処理
import { RiotManager } from '../riot/riotManager.js' // RiotManagerのインポート

export async function handleStartCommand(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString('channel', true)
  const guild = interaction.guild

  if (!guild) {
    await interaction.reply({ content: 'Guild not found.', ephemeral: true })
    return
  }

  const channel =
    guild.channels.cache.get(input) ||
    guild.channels.cache.find((c) => c.name === input && c.type === ChannelType.GuildVoice)

  if (!channel || channel.type !== ChannelType.GuildVoice) {
    await interaction.reply({ content: 'Voice channel not found.', ephemeral: true })
    return
  }

  await interaction.reply(`Joined voice channel "${channel.name}" and started reading chat.`)
  const riotManager = new RiotManager()
  await riotManager.start() // RiotManagerを開始
  const xmppMitm = await riotManager.getXmppMitm()
  if (xmppMitm) {
    await startVoiceReadLoop(channel, xmppMitm)
  }
}
