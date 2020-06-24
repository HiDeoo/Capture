import type { IpcRenderer } from 'electron'

declare global {
  /**
   * Optional value.
   */
  export type Optional<T> = T | undefined

  /**
   * Optional promise.
   */
  export type OptionalPromise<T> = T | Promise<T>

  /**
   * IPC access from the renderer process.
   */
  interface Window {
    ipcRenderer: IpcRenderer
  }
}

export {}
