import { VoiceChannel } from '@/typs/domain'
import { client } from '../api-client'

export const getVoiceChannels = async (guildId: string) => {
  const res = await client.get<VoiceChannel[]>('/voice-channels', { params: { guildId } })
  return res.data
}
