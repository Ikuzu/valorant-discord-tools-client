import { app } from 'electron'
import path from 'path'
import { oauthHandler } from '../discord/oauth/oauth-service'

/** URIスキームを OS に登録 */
export function registerCustomProtocol() {
  if (process.defaultApp) {
    app.setAsDefaultProtocolClient(process.env.CUSTOM_URL_SCHEME, process.execPath, [
      path.resolve(process.argv[1]),
    ])
  } else {
    app.setAsDefaultProtocolClient(process.env.CUSTOM_URL_SCHEME)
  }
}

export function handleSecondInstance() {
  app.on('second-instance', async (_event: Event, argv: string[]) => {
    const uri = argv.find((arg) => arg.startsWith(`${process.env.CUSTOM_URL_SCHEME}://`))
    if (!uri) return

    await oauthHandler(uri)
  })
}

export async function handleInitialProtocolLaunch() {
  const uri = process.argv.find(
    (arg) => typeof arg === 'string' && arg.startsWith(`${process.env.CUSTOM_URL_SCHEME}://`)
  )
  if (!uri) return
  await oauthHandler(uri)
}
