declare namespace NodeJS {
  interface ProcessEnv {
    ELECTRON_DISABLE_SECURITY_WARNINGS: boolean
    REACT_APP_BUGS_URL: string
    REACT_APP_VERSION: string
    REACT_APP_DROPBOX_CLIENT_ID: string
    REACT_APP_IMGUR_CLIENT_ID: string
    REACT_APP_IMGUR_CLIENT_SECRET: string
    REACT_APP_ONEDRIVE_CLIENT_ID: string
  }
}
