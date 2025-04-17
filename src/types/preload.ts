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
  'start-valorant': {
    data: { guildId: string; discordUserId: string }
    return: boolean
  }
  'update-settings': {
    data: AppSettings
    return: void
  }
  'get-settings': {
    data: {}
    return: AppSettings
  }
  logout: {
    data: {}
    return: void
  }
}

type ElectronIpcSend = {
  'log-message': { level: 'info' | 'warn' | 'error'; message: string }
}
