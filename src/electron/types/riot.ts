export interface PostSpeakRequest {
  messageId: string
  guildId: string
  discordUserId: string
  timestamp: string
  from: string
  to: string
  content: string
}
