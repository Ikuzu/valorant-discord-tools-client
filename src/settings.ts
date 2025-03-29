interface VoiceSettings {
  isMuted: boolean
  volume: number // 0 - 100
  speakerId: number
}

export const voiceSettingsMap = new Map<string, VoiceSettings>()
