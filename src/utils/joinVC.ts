import { VoiceChannel } from 'discord.js'
import { joinVoiceChannel } from '@discordjs/voice'

export function joinVC(vc: VoiceChannel) {
  joinVoiceChannel({
    channelId: vc.id,
    guildId: vc.guild.id,
    adapterCreator: vc.guild.voiceAdapterCreator
  })
}
