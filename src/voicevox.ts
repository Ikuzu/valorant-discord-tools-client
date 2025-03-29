import axios from 'axios'
import fs from 'fs'
import { VoicevoxSpeaker } from './types/voicevox.js'

const VOICEVOX_API_URL = 'http://127.0.0.1:50021'

export async function synthVoice(
  text: string,
  speakerId = 0,
  outPath = './voice.wav'
): Promise<string | null> {
  try {
    console.log('Requesting VOICEVOX synthesis...', { text })

    const queryRes = await axios.post(
      `${VOICEVOX_API_URL}/audio_query`,
      {},
      {
        params: { text, speaker: speakerId },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )

    if (queryRes.status !== 200) {
      console.error(`audio_query failed: ${queryRes.status} ${queryRes.statusText}`)
      return null
    }

    const synthRes = await axios.post(`${VOICEVOX_API_URL}/synthesis`, queryRes.data, {
      params: { speaker: speakerId },
      headers: {
        Accept: 'audio/wav',
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    })

    fs.writeFileSync(outPath, synthRes.data)
    return outPath
  } catch (err) {
    console.error('VOICEVOX error:', err)
    return null
  }
}

export async function fetchVoicevoxSpeakers(): Promise<VoicevoxSpeaker[]> {
  const res = await fetch('http://localhost:50021/speakers')
  return await res.json()
}
