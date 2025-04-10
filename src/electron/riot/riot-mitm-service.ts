import { XmppMITM } from './mitm/xmpp-mitm.js'
import { ConfigMITM } from './mitm/config-mitm.js'
import { getRiotClientPath } from './utils/riot-client-utils.js'
import { exec } from 'node:child_process'
import axios from 'axios'

export class RiotMitmService {
  private xmppMitm: XmppMITM | null
  private configMitm: ConfigMITM
  private httpPort = 35479
  private xmppPort = 35478
  private host = '127.0.0.1'

  constructor() {
    this.configMitm = new ConfigMITM(this.httpPort, this.host, this.xmppPort)
    this.xmppMitm = null
  }

  async start(guildId: string, discordUserId: string) {
    await this.configMitm.start()
    this.xmppMitm = new XmppMITM(this.xmppPort, this.configMitm)
    console.log('ConfigMITM started')

    // XmppMITMの開始
    await this.xmppMitm.start()
    console.log('XMPP listening...')
    this.sendLoop(guildId, discordUserId)
    const riotClientPath = await getRiotClientPath()
    exec(
      `"${riotClientPath}" --client-config-url="http://${this.host}:${this.httpPort}" --launch-product=valorant --launch-patchline=live`
    )
  }

  private sendLoop(guildId: string, discordUserId: string) {
    this.xmppMitm?.on('message', async (raw) => {
      const parsedMessage = parseMessage(raw)
      if (!parsedMessage) {
        console.error('メッセージの変換に失敗しました。')
      }

      const postData = {
        guildId,
        discordUserId,
        ...parsedMessage,
      }
      console.log('[SEND TO SERVER]', postData)

      await axios.post(
        'https://valorant-discord-tools-server-production.up.railway.app/speak',
        postData
      )
    })
  }
}
