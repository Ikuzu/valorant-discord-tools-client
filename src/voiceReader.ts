import { VoiceChannel } from 'discord.js'
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
  StreamType
} from '@discordjs/voice'
import { synthVoice } from './voicevox.js'
import { spawn } from 'child_process'
import { createRequire } from 'module'
import { voiceSettingsMap } from './settings.js'
import { XmppMITM } from './riot/XmppMITM.js'

export async function startVoiceReadLoop(vc: VoiceChannel, xmppMitm: XmppMITM) {
  const connection = joinVoiceChannel({
    channelId: vc.id,
    guildId: vc.guild.id,
    adapterCreator: vc.guild.voiceAdapterCreator
  })

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

  player.on(AudioPlayerStatus.Playing, () => {
    console.log('[VOICE] 再生中！')
  })
  player.on(AudioPlayerStatus.Idle, () => {
    console.log('[VOICE] 再生完了')
  })
  player.on('error', (error) => {
    console.error('[VOICE ERROR]', error)
  })

  const pollInterval = 2000
  const seenMessageIds = new Set<string>()
  const startTime = new Date()
  let previousLength = 0

  const loop = async () => {
    try {
      const allMessages = xmppMitm.messages

      // 差分のみ取得
      const newMessages = allMessages.slice(previousLength)
      previousLength = allMessages.length

      for (const msg of newMessages) {
        // stamp 抽出 → Dateに変換
        const stampMatch = msg.match(/stamp=['"]([^'"]+)['"]/)
        if (!stampMatch) continue

        const stamp = stampMatch[1]
        const msgTime = new Date(stamp)
        msgTime.setHours(msgTime.getHours() + 9) // JST補正
        if (msgTime < startTime) continue // 起動前のメッセージをスキップ

        // ID 抽出・重複排除
        const idMatch = msg.match(/id=['"]([^'"]+)['"]/)
        const messageId = idMatch?.[1]
        if (!messageId || seenMessageIds.has(messageId)) continue
        seenMessageIds.add(messageId)

        // 本文抽出
        const bodyMatch = msg.match(/<body>(.*?)<\/body>/s)
        if (!bodyMatch) continue

        const text = bodyMatch[1]

        const settings = voiceSettingsMap.get(vc.guild.id) ?? {
          isMuted: false,
          volume: 100,
          speakerId: 0
        }

        if (settings.isMuted) {
          console.log('[VOICE] ミュート中スキップ:', text)
          continue
        }

        const filePath = await synthVoice(text, settings.speakerId)
        if (!filePath) {
          console.warn('[VOICE] 合成失敗:', text)
          continue
        }

        const resource = createResource(filePath, settings.volume)
        player.play(resource)

        await entersState(player, AudioPlayerStatus.Idle, 30_000)
      }
    } catch (err) {
      console.error('[VOICE LOOP ERROR]', err)
    }
  }

  setInterval(loop, pollInterval)
}

const require = createRequire(import.meta.url)
const ffmpegPath: string = require('ffmpeg-static')

function createResource(filePath: string, volume: number) {
  const ffmpeg = spawn(
    ffmpegPath,
    [
      '-i',
      filePath,
      '-analyzeduration',
      '0',
      '-loglevel',
      '0',
      '-f',
      's16le',
      '-ar',
      '48000',
      '-ac',
      '2',
      'pipe:1'
    ],
    { stdio: ['pipe', 'pipe', 'ignore'] }
  )

  const resource = createAudioResource(ffmpeg.stdout, {
    inputType: StreamType.Raw,
    inlineVolume: true
  })

  resource.volume?.setVolume(volume / 100)
  return resource
}
