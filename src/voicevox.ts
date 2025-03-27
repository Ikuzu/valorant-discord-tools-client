import axios from 'axios'
import fs from 'fs'

const VOICEVOX_API_URL = 'http://127.0.0.1:50021'
const VOICEVOX_SPEAKER = 47

export async function synthVoice(text: string, outPath = './voice.wav'): Promise<string | null> {
  try {
    console.log('Requesting VOICEVOX synthesis...', { text })

    const queryRes = await axios.post(
      `${VOICEVOX_API_URL}/audio_query`,
      {},
      {
        params: { text, speaker: VOICEVOX_SPEAKER },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )

    if (queryRes.status !== 200) {
      console.error(`audio_query failed: ${queryRes.status} ${queryRes.statusText}`)
      return null
    }

    const synthRes = await axios.post(`${VOICEVOX_API_URL}/synthesis`, queryRes.data, {
      params: { speaker: VOICEVOX_SPEAKER },
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
