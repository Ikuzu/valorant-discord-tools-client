import { BrowserWindow } from 'electron'
import path from 'path'

export class MainWindow {
  private static mainWindow: BrowserWindow | null = null

  public static createMainWindow(): BrowserWindow {
    if (this.mainWindow) return this.mainWindow

    this.mainWindow = new BrowserWindow({
      minWidth: 400,
      minHeight: 400,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.cjs'),
      },
    })
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173')
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer', 'index.html'))
    }

    this.mainWindow.setMenuBarVisibility(false)

    // クローズ時に参照をクリア（再生成可）
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    return this.mainWindow
  }

  public static getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  public static send(channel: string, data?: any) {
    this.mainWindow?.webContents.send(channel, data)
  }

  public static isReady(): boolean {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed()
  }
}
