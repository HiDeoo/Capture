import type { BrowserWindow, IpcMain, IpcMainInvokeEvent, IpcRenderer, IpcRendererEvent, WebContents } from 'electron'

export type { IpcRendererEvent } from 'electron'

/**
 * Application main-to-renderer events.
 */
type CaptureMainToRendererEvents = {
  newOAuthRequest: (destinationId: string, queryString: ParsedQueryString, hash: Optional<ParsedQueryString>) => void
  newScreenshot: (path: string, size: number) => void
  windowBlur: () => void
  windowFocus: () => void
}

/**
 * Application renderer-to-main events.
 */
type CaptureRendererToMainEvents = {
  captureScreenshot: () => void
  closeWindow: () => void
  openFile: (path: string) => string
  openUrl: (url: string) => void
  saveImage: (path: string, data: string) => number
}

/**
 * Sends an asynchronous message to the renderer process on a specific channel.
 * @param window - The window containing the renderer process.
 * @param channel - The channel to use when sending the message.
 * @param args - The message arguments.
 */
export function sendToRenderer<IpcEvent extends keyof CaptureMainToRendererEvents>(
  window: BrowserWindow,
  channel: IpcEvent,
  ...args: Parameters<CaptureMainToRendererEvents[IpcEvent]>
): void {
  const webContents = window.webContents as CaptureWebContents<CaptureMainToRendererEvents>

  webContents.send(channel, ...args)
}

/**
 * Returns the typed IPC main module.
 * Note: this should only be used from the main process.
 * @return The typed IPC main.
 */
export function getIpcMain(unsafeIpcMain: IpcMain): CaptureIpcMain<CaptureRendererToMainEvents> {
  return unsafeIpcMain as CaptureIpcMain<CaptureRendererToMainEvents>
}

/**
 * Returns the typed IPC renderer module.
 * Note: this should only be used from the renderer process.
 * @return The typed IPC renderer.
 */
export function getIpcRenderer(): CaptureIpcRenderer<CaptureMainToRendererEvents, CaptureRendererToMainEvents> {
  return window.ipcRenderer as CaptureIpcRenderer<CaptureMainToRendererEvents, CaptureRendererToMainEvents>
}

/**
 * Structure describing events associated to messages sent between the main and renderere processes on a specific
 * channel and their associated handlers.
 */
type IPCEvents = Record<string, (...args: never) => void>

/**
 * Extension to `Electron.WebContents` supporting typed IPC messages.
 */
interface CaptureWebContents<MREvents extends IPCEvents> extends WebContents {
  send<Channel extends keyof MREvents>(channel: Channel, ...args: Parameters<MREvents[Channel]>): void
}

/**
 * Extension to `Electron.IpcMain` supporting typed IPC messages.
 */
interface CaptureIpcMain<RMEvents extends IPCEvents> extends IpcMain {
  handle<Channel extends keyof RMEvents>(
    channel: Channel,
    listener: (
      event: IpcMainInvokeEvent,
      ...args: Parameters<RMEvents[Channel]>
    ) => MaybePromise<ReturnType<RMEvents[Channel]>>
  ): void
  removeHandler<Channel extends keyof RMEvents>(channel: Channel): void
}

/**
 * Extension to `Electron.IpcRenderer` supporting typed IPC messages.
 */
interface CaptureIpcRenderer<MREvents extends IPCEvents, RMEvents extends IPCEvents> extends IpcRenderer {
  on<Channel extends keyof MREvents>(
    channel: Channel,
    listener: (event: IpcRendererEvent, ...args: Parameters<MREvents[Channel]>) => void
  ): this
  removeListener<Channel extends keyof MREvents>(
    channel: Channel,
    listener: (event: IpcRendererEvent, ...args: Parameters<MREvents[Channel]>) => void
  ): this
  invoke<Channel extends keyof RMEvents>(
    channel: Channel,
    ...args: Parameters<RMEvents[Channel]>
  ): Promise<ReturnType<RMEvents[Channel]>>
}
