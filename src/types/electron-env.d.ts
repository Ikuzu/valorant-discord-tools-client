import 'electron'
import type { IpcMainInvokeEvent } from 'electron'

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string
    VITE_PUBLIC: string
    NODE_ENV_ELECTRON_VITE: string

    API_BASE_URL: string
    CUSTOM_URL_SCHEME: string
    OAUTH_REDIRECT_URI: string
    OAUTH_CLIENT_ID: string
  }
}

declare global {
  interface Window {
    electron: {
      on<K extends keyof ElectronIpcEvents>(
        channel: K,
        callback: (data: ElectronIpcEvents[K]) => void
      ): void

      send<K extends keyof ElectronIpcSend>(
        channel: K,
        ...args: keyof ElectronIpcSend[K] extends never ? [] : [data: ElectronIpcSend[K]]
      ): void

      invoke<K extends keyof ElectronIpcInvoke>(
        channel: K,
        ...args: keyof ElectronIpcInvoke[K]['data'] extends never
          ? []
          : [data: ElectronIpcInvoke[K]['data']]
      ): Promise<ElectronIpcInvoke[K]['return']>

      off<K extends keyof ElectronIpcEvents>(
        channel: K,
        listener: (data: ElectronIpcEvents[K]) => void
      ): void
    }
  }
}

declare module 'electron' {
  namespace Electron {
    interface IpcMain {
      handle<K extends keyof ElectronIpcInvoke>(
        channel: K,
        listener: (
          event: IpcMainInvokeEvent,
          data: ElectronIpcInvoke[K]['data']
        ) => Promise<ElectronIpcInvoke[K]['return']> | ElectronIpcInvoke[K]['return']
      ): this
    }
  }
}
