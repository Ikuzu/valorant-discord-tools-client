import * as tls from 'node:tls'
import { ConfigMITM } from './ConfigMITM.js'
import * as fs from 'node:fs'
import path from 'path'

export class XmppMITM {
  private readonly _port: number
  private readonly _host: string
  private readonly _configMitm: ConfigMITM
  public messages: string[]
  private _socketID = 0

  constructor(port: number, host: string, configMitm: ConfigMITM) {
    this._port = port
    this._host = host
    this._configMitm = configMitm
    this.messages = []
  }

  async start() {
    console.log(await fs.promises.readFile(path.join(__dirname, '../certs/server.key')))
    return new Promise<void>(async (resolve) => {
      tls
        .createServer(
          {
            key: await fs.promises.readFile(path.join(__dirname, '../certs/server.key')),
            cert: await fs.promises.readFile(path.join(__dirname, '../certs/server.cert')),
            rejectUnauthorized: false,
            requestCert: false,
          },
          (socket) => {
            const ipv4LocalHost = socket.localAddress?.replace('::ffff:', '')
            const mapping = this._configMitm.affinityMappings.find(
              (mapping) => mapping.localHost === ipv4LocalHost
            )
            if (mapping === undefined) {
              console.log(`Unknown host ${socket.localAddress}`)
              socket.destroy()
              return
            }

            this._socketID++
            const currentSocketID = this._socketID

            console.log(`Connecting to ${mapping.riotHost}:${mapping.riotPort}...`)
            /*
            this._logStream.write(
              JSON.stringify({
                type: 'open-valorant',
                time: Date.now(),
                host: mapping.riotHost,
                port: mapping.riotPort,
                socketID: currentSocketID
              }) + '\n'
               
            )*/

            let preConnectBuffer = Buffer.alloc(0)

            const riotTLS = tls.connect(
              {
                host: mapping.riotHost,
                port: mapping.riotPort,
                rejectUnauthorized: false,
                requestCert: false,
              },
              () => {
                if (preConnectBuffer.length > 0) {
                  riotTLS.write(preConnectBuffer)
                  preConnectBuffer = Buffer.alloc(0)
                }
                /*
                this._logStream.write(
                  JSON.stringify({
                    type: 'open-riot',
                    time: Date.now(),
                    socketID: currentSocketID
                  }) + '\n'
                )
                  */
              }
            )

            riotTLS.on('data', (data) => {
              this.messages.push(data.toString())
              /*
              this._logStream.write(
                JSON.stringify({
                  type: 'incoming',
                  time: Date.now(),
                  data: data.toString(),
                }) + '\n'
              )
                */
              socket.write(data)
            })

            riotTLS.on('close', () => {
              /*
              this._logStream.write(
                JSON.stringify({
                  type: 'close-riot',
                  time: Date.now(),
                  socketID: currentSocketID,
                }) + '\n'
              )
                */
            })

            riotTLS.on('error', (error) => {
              console.error('Riot TLS error:', error)
            })

            socket.on('data', (data) => {
              /*
              this._logStream.write(
                JSON.stringify({
                  type: 'outgoing',
                  time: Date.now(),
                  data: data.toString(),
                }) + '\n'
              )
                */
              if (riotTLS.connecting) {
                preConnectBuffer = Buffer.concat([preConnectBuffer, data])
              } else {
                riotTLS.write(data)
              }
            })

            socket.on('close', () => {
              /*
              this._logStream.write(
                JSON.stringify({
                  type: 'close-valorant',
                  time: Date.now(),
                  socketID: currentSocketID,
                }) + '\n'
              )
                */
              console.log(`Disconnected from ${mapping.riotHost}:${mapping.riotPort}`)
            })

            socket.on('error', (error) => {
              console.error('Valorant TLS error:', error)
            })
          }
        )
        .listen(this._port, () => {
          resolve()
        })
    })
  }
}
