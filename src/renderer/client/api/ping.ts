import { client } from '../api-client'

export const ping = async () => {
  try {
    await client.get('/ping')
    return true
  } catch {
    return false
  }
}
