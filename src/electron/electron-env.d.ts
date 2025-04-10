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

interface Window {
  electron: import('electron').IpcRenderer
}
