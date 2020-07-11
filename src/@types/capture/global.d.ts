import type { IpcRenderer } from 'electron'

declare global {
  /**
   * Optional value.
   */
  export type Optional<T> = T | undefined

  /**
   * A value that may be wrapped in a promise or not.
   */
  export type MaybePromise<T> = T | Promise<T>

  /**
   * A type matching the known keys of an interface and excluding potential index signatures.
   * @see https://stackoverflow.com/a/51955852/1945960
   */
  export type KnownKeys<T> = {
    [K in keyof T]: string extends K ? never : number extends K ? never : K
  } extends { [_ in keyof T]: infer U }
    ? U
    : never

  /**
   * IPC access from the renderer process.
   */
  interface Window {
    ipcRenderer: IpcRenderer
  }

  /**
   * Common type between the main & renderer processes describing a parsed query string.
   */
  export type ParsedQueryString = Record<string, Optional<string>>
}

export {}
