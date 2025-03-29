export interface VoicevoxStyle {
  name: string
  id: number
  type: 'talk' | 'other' // 他のtypeがあれば追加
}

export interface VoicevoxSpeaker {
  name: string
  speaker_uuid: string
  styles: VoicevoxStyle[]
  version: string
  supported_features: {
    permitted_synthesis_morphing: 'ALL' | string // 他の可能性があれば追加
  }
}
