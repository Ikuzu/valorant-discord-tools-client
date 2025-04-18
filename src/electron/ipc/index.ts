export async function handleIpcHandlers() {
  import('./handlers/start-discord-oauth')
  import('./handlers/start-valorant')
  import('./handlers/settings')
}
