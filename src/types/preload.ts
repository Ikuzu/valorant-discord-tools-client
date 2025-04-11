type ElectronIpcEvents = {
  'oauth-success': { userId: string; userName: string; userAvatar: string }
  'oauth-failed': void
  'mitm-status': 'connecting' | 'connected' | 'disconnected' | 'error'
}

type ElectronIpcInvoke = {
  'start-discord-oauth': {
    data: {}
    return: { status: 'auto-login' | 'browser-oauth' | 'no-window' }
  }
  'fetch-guilds': {
    data: { discordUserId: string }
    return: { guildId: string; guildName: string }[]
  }
  'start-valorant': {
    data: { guildId: string; discordUserId: string }
    return: { status: 'started' | 'failed' }
  }
}

type ElectronIpcSend = {
  'log-message': { level: 'info' | 'warn' | 'error'; message: string }
}
