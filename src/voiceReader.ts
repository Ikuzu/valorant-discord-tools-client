import { VoiceChannel } from 'discord.js'
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus
} from '@discordjs/voice'
import { fetchChatMessages } from './riotClient.js'
import { synthVoice } from './voicevox.js'

export async function startVoiceReadLoop(vc: VoiceChannel) {
  const connection = joinVoiceChannel({
    channelId: vc.id,
    guildId: vc.guild.id,
    adapterCreator: vc.guild.voiceAdapterCreator
  })

  // 接続安定化のため、ステート確認
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 5_000)
    console.log(`[VC] Connected to "${vc.name}"`)
  } catch {
    console.error(`[VC] Failed to connect to "${vc.name}"`)
    connection.destroy()
    return
  }

  const player = createAudioPlayer()
  connection.subscribe(player)

  const pollInterval = 2000

  const loop = async () => {
    try {
      const newMessages = await fetchChatMessages()
      for (const msg of newMessages) {
        const text = `${msg.sender} said: ${msg.content}`
        console.log('[VOICE]', text)

        const filePath = await synthVoice(text)
        if (!filePath) {
          console.warn('[VOICE] Failed to synthesize:', text)
          continue
        }
        const resource = createAudioResource(filePath)
        player.play(resource)

        await entersState(player, AudioPlayerStatus.Idle, 30_000)
      }
    } catch (err) {
      console.error('[VOICE LOOP ERROR]', err)
    }
  }

  // 定期実行
  setInterval(loop, pollInterval)
}
