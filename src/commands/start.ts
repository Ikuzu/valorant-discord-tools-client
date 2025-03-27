import { ChatInputCommandInteraction, ChannelType } from 'discord.js'
import { startVoiceReadLoop } from '../voiceReader.js'

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
  await startVoiceReadLoop(channel)
}
