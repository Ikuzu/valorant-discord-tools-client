type TTSEngine = 'default' | 'coeiroink' | 'aivoice'

interface AppSettings {
  volume: number
  ttsEngine: TTSEngine
  speakerId: string
  styleId: string
}
