import { app } from 'electron'
import path from 'path'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import {
  registerCustomProtocol,
  handleSecondInstance,
  handleInitialProtocolLaunch,
} from './core/protocol'
import { MainWindow } from './core/main-window'
import { handleIpcHandlers } from './ipc'

// .env 読み込み
const env = config({ path: path.join(__dirname, '.env') })
expand(env)

// カスタムプロトコル登録
registerCustomProtocol()

// 多重起動を防ぐ
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.whenReady().then(async () => {
    MainWindow.createMainWindow()
    // 起動時のカスタムスキームURI処理（初回起動分）
    handleInitialProtocolLaunch()
  })

  handleIpcHandlers()
  // second-instance は protocol.ts 側で一元管理
  handleSecondInstance()
}
