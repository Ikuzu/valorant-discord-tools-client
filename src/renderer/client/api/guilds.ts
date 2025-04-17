import { Guild } from '@/typs/domain'
import { client } from '../api-client'

export const getGuilds = async (discordUserId: string) => {
  const res = await client.get<Guild[]>('/user-guild', { params: { discordUserId } })
  return res.data
}
