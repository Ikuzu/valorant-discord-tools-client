// electron/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  on: <K extends keyof ElectronIpcEvents>(
    channel: K,
    callback: (data: ElectronIpcEvents[K]) => void
  ) => {
    const listener = (_event: IpcRendererEvent, data: ElectronIpcEvents[K]) => callback(data)
    ipcRenderer.on(channel, listener)
    return listener // listenerを返す
  },

  off: <K extends keyof ElectronIpcEvents>(
    channel: K,
    listener: Parameters<typeof ipcRenderer.on>[1] // 正しい型のlistener
  ) => {
    ipcRenderer.removeListener(channel, listener)
  },

  send: <K extends keyof ElectronIpcSend>(channel: K, data: ElectronIpcSend[K]) => {
    ipcRenderer.send(channel, data)
  },

  invoke: <K extends keyof ElectronIpcInvoke>(channel: K, data: ElectronIpcInvoke[K]) => {
    return ipcRenderer.invoke(channel, data)
  },
})
