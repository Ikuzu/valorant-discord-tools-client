import axios from 'axios'
import fs from 'fs'

export async function synthVoice(text: string, path: string = './voice.wav') {
  const speaker = process.env.VOICEVOX_SPEAKER || '1'

  const query = await axios.post('http://localhost:50021/audio_query', null, {
    params: { text, speaker }
  })

  const res = await axios.post('http://localhost:50021/synthesis', query.data, {
    params: { speaker },
    responseType: 'arraybuffer'
  })

  fs.writeFileSync(path, res.data)
  return path
}
