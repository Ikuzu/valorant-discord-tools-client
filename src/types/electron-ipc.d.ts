import { IpcMainInvokeEvent } from 'electron'

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
