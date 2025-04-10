import * as tls from 'node:tls'
import { ConfigMITM } from './config-mitm'
import * as fs from 'node:fs'
import path from 'path'
import { EventEmitter } from 'node:events'

export class XmppMITM extends EventEmitter {
  private readonly _port: number
  private readonly _configMitm: ConfigMITM
  private _socketID = 0

  constructor(port: number, configMitm: ConfigMITM) {
    super()
    this._port = port
    this._configMitm = configMitm
  }

  async start() {
    console.log(await fs.promises.readFile(path.join(__dirname, 'certs/server.key')))
    return new Promise<void>(async (resolve) => {
      tls
        .createServer(
          {
            key: await fs.promises.readFile(path.join(__dirname, 'certs/server.key')),
            cert: await fs.promises.readFile(path.join(__dirname, 'certs/server.cert')),
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

            console.log(`Connecting to ${mapping.riotHost}:${mapping.riotPort}...`)

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
              }
            )

            riotTLS.on('data', (data) => {
              const message = data.toString()
              this.emit('message', message)
              socket.write(data)
            })

            riotTLS.on('close', () => {
              console.log('riotTLS closed')
            })

            riotTLS.on('error', (error) => {
              console.error('Riot TLS error:', error)
            })

            socket.on('data', (data) => {
              if (riotTLS.connecting) {
                preConnectBuffer = Buffer.concat([preConnectBuffer, data])
              } else {
                riotTLS.write(data)
              }
            })

            socket.on('close', () => {
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
