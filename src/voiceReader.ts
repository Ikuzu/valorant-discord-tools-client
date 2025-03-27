import { VoiceChannel } from 'discord.js'
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} from '@discordjs/voice'
import { fetchChatMessages } from './riotClient'
import { synthVoice } from './voicevox'

export async function startVoiceReadLoop(vc: VoiceChannel) {
  const connection = joinVoiceChannel({
    channelId: vc.id,
    guildId: vc.guild.id,
    adapterCreator: vc.guild.voiceAdapterCreator
  })

  const player = createAudioPlayer()
  connection.subscribe(player)

  setInterval(async () => {
    const newMessages = await fetchChatMessages()
    for (const msg of newMessages) {
      const text = `${msg.sender}が言いました。${msg.content}`
      console.log('[VOICE] 読み上げ:', text)
      const filePath = await synthVoice(text)
      const resource = createAudioResource(filePath)
      player.play(resource)

      await new Promise((resolve) => {
        player.once(AudioPlayerStatus.Idle, resolve)
      })
    }
  }, 2000)
}
