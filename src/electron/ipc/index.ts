export async function handleIpcHandlers() {
  await import('./handlers/start-discord-oauth')
  await import('./handlers/start-valorant')
}
