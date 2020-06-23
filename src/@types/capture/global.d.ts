import type { IpcRenderer } from 'electron'

declare global {
  /**
   * Optional value.
   */
  export type Optional<T> = T | undefined

  /**
   * IPC access from the renderer process.
   */
  interface Window {
    ipcRenderer: IpcRenderer
  }
}

export {}
