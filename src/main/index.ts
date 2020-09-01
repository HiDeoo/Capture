import { spawn } from 'child_process'
import type { FSWatcher } from 'chokidar'
import dateFormat from 'date-fns/format'
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain as unsafeIpcMain,
  IpcMainInvokeEvent,
  Menu,
  protocol,
  Tray,
} from 'electron'
import isDev from 'electron-is-dev'
import windowStateKeeper from 'electron-window-state'
import path from 'path'
import querystring from 'querystring'

import Theme from '../utils/theme'
import { handleError, handleFatalError } from './errors'
import { getIpcMain, sendToRenderer } from './ipc'
import {
  chooseDirectory,
  copyTextToClipboard,
  deleteFile,
  getBugReportInfos,
  getDefaultScreenshotDirectory,
  openFile,
  openUrl,
  quit,
  saveImage,
} from './ipcHandlers'
import { getElectronPrebuiltPath, getRendererUri } from './paths'
import { ensurePermissions } from './permissions'
import { createTray } from './tray'
import { installCreatedFileWatcher, uninstallFileWatcher } from './watcher'

/**
 * The typed IPC main module.
 */
const ipcMain = getIpcMain(unsafeIpcMain)

/**
 * Application browser window instance.
 */
let window: BrowserWindow | null = null

/**
 * Application window state managing its position & size.
 */
let windowState: windowStateKeeper.State | null = null

/**
 * Application tray instance.
 */
let appTray: Tray | null = null

/**
 * Path of the directory used to save screenshots.
 */
let screenshotDirectory: Optional<string>

/**
 * File watcher instance.
 */
let watcher: Optional<FSWatcher>

/**
 * Defines if the application is explicitely quitting (eg. Cmd+Q on macOS).
 */
let isApplicationQuitting = false

/**
 * Defines if the screencapture utility sounds are enabled or not.
 */
let playScreenCaptureSounds = true

/**
 * Creates the application window.
 */
async function createWindow(): Promise<void> {
  // Initialize window state.
  windowState = windowStateKeeper({
    defaultHeight: 768,
    defaultWidth: 1024,
    fullScreen: false,
    maximize: false,
  })

  // Create the browser window.
  window = new BrowserWindow({
    backgroundColor: Theme.window.background,
    frame: false,
    fullscreenable: false,
    height: windowState.height,
    maximizable: false,
    minHeight: 768,
    minimizable: false,
    minWidth: 1024,
    show: false,
    webPreferences: {
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload'),
      // Disable the `webSecurity` option in dev mode so we can load images from the filesystem while serving the
      // renderer application from an HTTP server.
      // This is not an issue in production as we are serving the renderer application from the filesystem in that case.
      webSecurity: !isDev,
    },
    width: windowState.width,
    x: windowState.x,
    y: windowState.y,
  })

  // Persist window position & size.
  windowState.manage(window)

  // Remove default application menu.
  Menu.setApplicationMenu(null)

  // Set the user agent for the window.
  window.webContents.setUserAgent('Capture')

  // Sets the application as default handler for the `capture://` URI scheme.
  app.setAsDefaultProtocolClient('capture')

  // Handle window lifecycle.
  window.on('close', onWindowClose)
  window.on('closed', onWindowClosed)
  window.on('blur', onWindowBlur)
  window.on('focus', onWindowFocus)

  // Ensure loading images from the filesystem works as expected.
  protocol.registerFileProtocol('file', (request, callback) => {
    callback(decodeURIComponent(request.url.replace('file:///', '')))
  })

  // Handle IPC messages from the renderer process.
  registerIpcHandlers()

  // Load the renderer application for the application window.
  try {
    await window.loadURL(getRendererUri())
  } catch (error) {
    handleFatalError('Could not load application.', error, window)
  }

  if (isDev) {
    // Enable reloading of the main process in dev mode.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron-reload')(__dirname, {
      electron: getElectronPrebuiltPath(),
      forceHardReset: true,
      hardResetMethod: 'exit',
    })

    // Open the devtools in dev mode.
    window.webContents.openDevTools({ mode: 'undocked', activate: false })
  }

  // Create the application tray.
  appTray = createTray(window)

  // Check permissions.
  ensurePermissions()
}

/**
 * Registers IPC handlers for messages from the renderer process.
 */
function registerIpcHandlers(): void {
  ipcMain.handle('captureScreenshot', captureScreenshot)
  ipcMain.handle('chooseDirectory', chooseDirectory)
  ipcMain.handle('closeWindow', onWindowClose)
  ipcMain.handle('copyTextToClipboard', copyTextToClipboard)
  ipcMain.handle('deleteFile', deleteFile)
  ipcMain.handle('getBugReportInfos', getBugReportInfos)
  ipcMain.handle('getDefaultScreenshotDirectory', getDefaultScreenshotDirectory)
  ipcMain.handle('newCaptureScreenshotShortcut', onNewCaptureScreenshotShortcut)
  ipcMain.handle('newScreenCaptureSounds', onNewScreenCaptureSounds)
  ipcMain.handle('newScreenshotDirectory', onNewScreenshotDirectory)
  ipcMain.handle('openFile', openFile)
  ipcMain.handle('openUrl', openUrl)
  ipcMain.handle('quit', quit)
  ipcMain.handle('saveImage', saveImage)
}

/**
 * Unregisters IPC handlers for messages from the renderer process.
 */
function unregisterIpcHandlers(): void {
  ipcMain.removeHandler('captureScreenshot')
  ipcMain.removeHandler('chooseDirectory')
  ipcMain.removeHandler('closeWindow')
  ipcMain.removeHandler('copyTextToClipboard')
  ipcMain.removeHandler('deleteFile')
  ipcMain.removeHandler('getBugReportInfos')
  ipcMain.removeHandler('getDefaultScreenshotDirectory')
  ipcMain.removeHandler('newCaptureScreenshotShortcut')
  ipcMain.removeHandler('newScreenCaptureSounds')
  ipcMain.removeHandler('newScreenshotDirectory')
  ipcMain.removeHandler('openFile')
  ipcMain.removeHandler('openUrl')
  ipcMain.removeHandler('quit')
  ipcMain.removeHandler('saveImage')
}

/**
 * Captures a screenshot.
 */
function captureScreenshot(): void {
  // Ensure permissions are still correct.
  const hasPermissions = ensurePermissions()

  if (!hasPermissions || !window) {
    return
  }

  const errorMessage = 'Something went wrong while capturing a screenshot.'

  if (!screenshotDirectory) {
    handleError(errorMessage, new Error('No screenshot directory provided.'), window)

    return
  }

  const now = new Date()
  const filename = `Screenshot ${dateFormat(now, 'y-MM-dd')} at ${dateFormat(now, 'HH:mm:ss')}.png`

  const args = ['-i', '-o', path.join(screenshotDirectory, filename)]

  if (!playScreenCaptureSounds) {
    args.unshift('-x')
  }

  const child = spawn('screencapture2', args)

  child.on('error', (error) => {
    handleError(errorMessage, error, window)
  })
}

/**
 * Triggered when a new shortcut to capture a screenshot is set.
 * @param shortcut - The new shortcut.
 */
function onNewCaptureScreenshotShortcut(event: IpcMainInvokeEvent, shortcut: string): void {
  try {
    // Unregister any existing shortcuts.
    globalShortcut.unregisterAll()

    const newShortcut = globalShortcut.register(shortcut, captureScreenshot)

    if (!newShortcut) {
      throw new Error('Could not register global shortcut.')
    }
  } catch (error) {
    handleError('Unable to register global shortcut.', error, window)
  }
}

/**
 * Triggered when the screencapture sounds setting is set.
 * @param enabled - `true` when the sounds are enabled.
 */
function onNewScreenCaptureSounds(event: IpcMainInvokeEvent, enabled: boolean): void {
  playScreenCaptureSounds = enabled
}

/**
 * Triggered when a new screenshot directory is set.
 * @param directoryPath - The new screenshot directory path.
 */
async function onNewScreenshotDirectory(event: IpcMainInvokeEvent, directoryPath: string): Promise<void> {
  screenshotDirectory = directoryPath

  if (watcher) {
    await uninstallFileWatcher(watcher)
    watcher = undefined
  }

  try {
    // Add a file watcher to detect new screenshots.
    watcher = await installCreatedFileWatcher(screenshotDirectory, (createdFilePath, size) => {
      if (window) {
        sendToRenderer(window, 'newScreenshot', createdFilePath, size)

        window.show()
        window.focus()
      }
    })
  } catch (error) {
    handleError(`The screenshot directory (${screenshotDirectory}) does not exist or is not readable.`, error, window)
  }
}

/**
 * Triggered when the user wants to open an URL with the application.
 * Note: this only works when the application is bundled.
 * @param event - The associated event.
 * @param url - The URL that was used.
 */
function onOpenUrl(event: Electron.Event, url: string): void {
  const parsedUrl = new URL(url)

  // Ignore URLs not matching the proper scheme.
  if (parsedUrl.protocol !== 'capture:' || !window) {
    return
  }

  // Signal that the application is handling the event.
  event.preventDefault()

  // Handle OAuth calls.
  if (parsedUrl.hostname === 'oauth' && parsedUrl.pathname.length > 2) {
    const destinationId = parsedUrl.pathname.substr(1)
    const queryString = querystring.parse(parsedUrl.search.replace(/^\?/, '')) as ParsedQueryString

    let parsedHash: Optional<ParsedQueryString> = undefined

    if (parsedUrl.hash.length > 2) {
      const sanitizedHash = parsedUrl.hash.startsWith('#') ? parsedUrl.hash.substr(1) : parsedUrl.hash
      parsedHash = querystring.parse(sanitizedHash) as ParsedQueryString
    }

    sendToRenderer(window, 'newOAuthRequest', destinationId, queryString, parsedHash)
  }
}

/**
 * Triggered when the application window is going to be closed.
 * @param window - The associated window.
 * @param event - The associated event.
 */
function onWindowClose(event: Electron.Event): void {
  // Hide the window instead of closing it if we're not explicitely quitting.
  if (!isApplicationQuitting) {
    event.preventDefault()

    window?.hide()
  }
}

/**
 * Triggered when the application window is closed.
 */
function onWindowClosed(): void {
  appTray?.destroy()
  appTray = null

  window = null
}

/**
 * Triggered when the application window loses focus.
 */
function onWindowBlur(): void {
  if (window) {
    sendToRenderer(window, 'windowBlur')
  }
}

/**
 * Triggered when the application window gains focus.
 */
function onWindowFocus(): void {
  if (window) {
    sendToRenderer(window, 'windowFocus')
  }
}

/**
 * Triggered before the application starts closing its windows.
 */
function onBeforeQuit(): void {
  isApplicationQuitting = true
}

/**
 * Triggered when the application will quit.
 */
async function onWillQuit(): Promise<void> {
  try {
    if (watcher) {
      await uninstallFileWatcher(watcher)
    }
  } finally {
    // Unregister IPC handlers.
    unregisterIpcHandlers()

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
  }
}

/**
 * Tests a custom URI scheme by tricking the application by manually calling `onOpenUrl` after a few seconds with a
 * specific URL as on macOS, we can only register protocols that have been added in the application `info.plist`, which
 * cannot be modified at runtime or in dev mode.
 * Note: this only works in dev mode.
 * @see https://www.electronjs.org/docs/api/app#appsetasdefaultprotocolclientprotocol-path-args
 * @param url
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function debugCustomScheme(url: string): void {
  if (isDev) {
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      onOpenUrl({ preventDefault: () => {} }, url)
    }, 5000)
  }
}

if (isDev) {
  /**
   * Disable CORS in dev mode so we can make API calss from the renderer application while serving it from an HTTP
   * server.
   * This is not an issue in production as we are serving the renderer application from the filesystem in that case.
   * Note: this should not be necessary as we are also disabling the `webSecurity` option in dev mode but this is an
   * issue in the Electron version we are using (and still not fixed as of 15/07/20).
   * @see https://github.com/electron/electron/issues/23664
   */
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

  // Hide security warnings in dev as we are explicitely disabling the `webSecurity` option in dev mode to load images
  // from the filesystem while serving the renderer application from an HTTP server.
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
}

// Hide the Dock icon.
app.dock.hide()

/**
 * Handle application lifecycle.
 */
app.on('ready', createWindow)
app.on('open-url', onOpenUrl)
app.on('before-quit', onBeforeQuit)
app.on('will-quit', onWillQuit)
