import { spawn } from 'child_process'
import type { FSWatcher } from 'chokidar'
import dateFormat from 'date-fns/format'
import dotenv from 'dotenv-flow'
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain as unsafeIpcMain,
  IpcMainInvokeEvent,
  protocol,
  shell,
  Tray,
} from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'
import querystring from 'querystring'
import wretch from 'wretch'

import { getDestination } from '../destinations'
import { DestinationId, DestinationSettings } from '../utils/Destination'
import Theme from '../utils/theme'
import { getIpcMain, sendToRenderer } from './ipc'
import { getElectronPrebuiltPath, getRendererUri } from './paths'
import { createTray } from './tray'
import { installCreatedFileWatcher, uninstallFileWatcher } from './watcher'

/**
 * The typed IPC main module.
 */
const ipcMain = getIpcMain(unsafeIpcMain)

// TODO Remove
const TMP_WORKING_DIRECTORY = '/Users/hideo/tmp/capture'

/**
 * Application browser window instance.
 */
let window: BrowserWindow | null = null

/**
 * Application tray instance.
 */
let appTray: Tray | null = null

/**
 * File watcher instance.
 */
let watcher: Optional<FSWatcher>

/**
 * Defines if the application is explicitely quitting (eg. Cmd+Q on macOS).
 */
let isApplicationQuitting = false

/**
 * Creates the application window.
 */
async function createWindow(): Promise<void> {
  // Create the browser window.
  window = new BrowserWindow({
    backgroundColor: Theme.window.background,
    frame: false,
    height: 600,
    show: false,
    webPreferences: {
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload'),
      // We disable the `webSecurity` option in dev mode so we can load images from the filesystem while serving the
      // renderer application from an HTTP server.
      // This is not an issue in production as we are serving the renderer application from the filesystem in that case.
      webSecurity: !isDev,
    },
    width: 800,
  })

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

  // Load the renderer application for the application window.
  try {
    await window.loadURL(getRendererUri())
  } catch (error) {
    // TODO Handle errors
    console.log('error ', error)
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

  // Add a file watcher to detect new screenshots.
  watcher = installCreatedFileWatcher(TMP_WORKING_DIRECTORY, (createdFilePath) => {
    // TODO Extract fn
    console.log('Created file: ', createdFilePath)

    if (window) {
      sendToRenderer(window, 'newScreenshot', createdFilePath)

      window.show()
      window.focus()
    }
  })

  // Register global shrotcuts.
  registerGlobalShortcuts()

  // Handle IPC messages from the renderer process.
  registerIpcHandlers()
}

/**
 * Registers the application global shortcuts.
 */
function registerGlobalShortcuts(): void {
  try {
    // TODO Make shortcut customizable
    const shortcut = globalShortcut.register('Cmd+B', onScreenshotShortcut)

    if (!shortcut) {
      throw new Error('Unable to register global shortcut.')
    }
  } catch (error) {
    // TODO Handle errors
    console.log('error ', error)
  }
}

/**
 * Registers IPC handlers for messages from the renderer process.
 */
function registerIpcHandlers(): void {
  // TODO Clean, refactor & extract maybe

  ipcMain.handle('closeWindow', onWindowClose)

  ipcMain.handle('openUrl', (event: IpcMainInvokeEvent, url: string) => {
    return shell.openExternal(url)
  })

  ipcMain.handle(
    'shareScreenshot',
    async (
      event: IpcMainInvokeEvent,
      destinationId: DestinationId,
      filePath: string,
      destinationSettings: DestinationSettings
    ) => {
      // TODO Extract & do something relevant
      const destination = getDestination(destinationId)

      await destination.share(filePath, destinationSettings)

      if (window?.isVisible()) {
        window.hide()
      }
    }
  )
}

/**
 * Unregisters IPC handlers for messages from the renderer process.
 */
function unregisterIpcHandlers(): void {
  ipcMain.removeHandler('closeWindow')
  ipcMain.removeHandler('openUrl')
  ipcMain.removeHandler('shareScreenshot')
}

/**
 * Triggered when the global screenshot shortcut is pressed.
 */
function onScreenshotShortcut(): void {
  // TODO Refactor & extract (maybe extract all shortcuts code)
  const now = new Date()
  const filename = `Screenshot ${dateFormat(now, 'y-MM-dd')} at ${dateFormat(now, 'HH:mm:ss')}.png`

  const child = spawn('screencapture', ['-i', '-o', path.join(TMP_WORKING_DIRECTORY, filename)])

  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (data) => {
    console.log('stdout: ' + data)
  })

  child.stderr.setEncoding('utf8')
  child.stderr.on('data', function (data) {
    console.log('stderr: ' + data)
  })

  child.on('close', function (code) {
    console.log('Done screenshoting')
  })
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
    const queryString = querystring.parse(parsedUrl.search) as ParsedQueryString

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

// Hide security warnings in dev as we are explicitely disabling the `webSecurity` option in dev mode to load images
// from the filesystem while serving the renderer application from an HTTP server.
if (isDev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
}

// Hide the Dock icon.
app.dock.hide()

// Load dotenv configuration in the main process.
dotenv.config({ path: isDev ? process.cwd() : app.getAppPath() })

// Configure wretch polyfills.
wretch().polyfills({
  fetch: require('node-fetch'),
  FormData: require('form-data'),
  URLSearchParams: require('url').URLSearchParams,
})

/**
 * Handle application lifecycle.
 */
app.on('ready', createWindow)
app.on('open-url', onOpenUrl)
app.on('before-quit', onBeforeQuit)
app.on('will-quit', onWillQuit)
