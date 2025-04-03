declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string
    VITE_PUBLIC: string
    NODE_ENV_ELECTRON_VITE: string

    // ↓ 追加する環境変数（.env に記述されるもの）
    API_BASE_URL?: string
    OAUTH_REDIRECT_URI?: string
    OAUTH_CLIENT_ID?: string
    OAUTH_CLIENT_SECRET?: string
  }
}

interface Window {
  ipcRenderer: import('electron').IpcRenderer
}
