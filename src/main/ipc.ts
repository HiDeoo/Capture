import type { BrowserWindow, WebContents, IpcRenderer, IpcRendererEvent } from 'electron'

/**
 * Application main-to-renderer events.
 */
type CaptureMainToRendererEvents = {
  newScreenshot: (path: string) => void
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
 * Returns the IPC renderer module.
 * Note: this should only be used from the renderer process.
 * @return The IPC renderer.
 */
export function getIpcRenderer(): CaptureIpcRenderer<CaptureMainToRendererEvents> {
  return window.ipcRenderer as CaptureIpcRenderer<CaptureMainToRendererEvents>
}

/**
 * Structure describing events associated to messages sent from the main process to the renderer on a specific channel
 * and their associated handlers.
 */
type IpcMainToRenderEvents = Record<string, (...args: never) => void>

/**
 * Extension to `Electron.WebContents` supporting typed IPC messages.
 */
interface CaptureWebContents<IpcEvents extends IpcMainToRenderEvents> extends WebContents {
  send<Channel extends keyof IpcEvents>(channel: Channel, ...args: Parameters<IpcEvents[Channel]>): void
}

/**
 * Extension to `Electron.IpcRenderer` supporting typed IPC messages.
 */
interface CaptureIpcRenderer<IpcEvents extends IpcMainToRenderEvents> extends IpcRenderer {
  on<Channel extends keyof IpcEvents>(
    channel: Channel,
    listener: (event: IpcRendererEvent, ...args: Parameters<IpcEvents[Channel]>) => void
  ): this
}
