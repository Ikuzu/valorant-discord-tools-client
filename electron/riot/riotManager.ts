import { XmppMITM } from './XmppMITM.js'
import { ConfigMITM } from './ConfigMITM.js'
import { getRiotClientPath } from './riotClientUtils.js'
import { exec } from 'node:child_process'

export class RiotManager {
  private xmppMitm: XmppMITM | null
  private configMitm: ConfigMITM
  private httpPort = 35479
  private xmppPort = 35478
  private host = '127.0.0.1'

  constructor() {
    this.configMitm = new ConfigMITM(this.httpPort, this.host, this.xmppPort)
    this.xmppMitm = null
  }

  async start() {
    await this.configMitm.start()
    this.xmppMitm = new XmppMITM(this.xmppPort, this.host, this.configMitm)
    console.log('ConfigMITM started')

    // XmppMITMの開始
    await this.xmppMitm.start()
    console.log('XMPP listening...')
    const riotClientPath = await getRiotClientPath()
    exec(
      `"${riotClientPath}" --client-config-url="http://${this.host}:${this.httpPort}" --launch-product=valorant --launch-patchline=live`
    )
  }

  getXmppMitm() {
    return this.xmppMitm
  }
}
