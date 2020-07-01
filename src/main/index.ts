import { spawn } from 'child_process'
import type { FSWatcher } from 'chokidar'
import dateFormat from 'date-fns/format'
import { app, BrowserWindow, globalShortcut, ipcMain, IpcMainInvokeEvent, protocol, Tray } from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'

import { getDestination } from '../destinations'
import { getIpcMain, sendToRenderer } from './ipc'
import { getElectronPrebuiltPath, getRendererUri } from './paths'
import { createTray } from './tray'
import { installCreatedFileWatcher, uninstallFileWatcher } from './watcher'
import { DestinationId } from '../libs/Destination'

// TODO Remove
const TMP_WORKING_DIRECTORY = '/Users/hideo/tmp/capture'

/**
 * Application browser window instance.
 */
let mainWindow: BrowserWindow | null = null

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
 * Creates the main window.
 */
async function createMainWindow(): Promise<void> {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: false,
    height: 600,
    show: true,
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

  // Handle window lifecycle.
  mainWindow.on('close', onMainWindowClose)
  mainWindow.on('closed', onMainWindowClosed)

  // Ensure loading images from the filesystem works as expected.
  protocol.registerFileProtocol('file', (request, callback) => {
    callback(decodeURIComponent(request.url.replace('file:///', '')))
  })

  // Load the renderer application for the main window.
  try {
    await mainWindow.loadURL(getRendererUri())
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
    mainWindow.webContents.openDevTools({ mode: 'undocked', activate: false })
  }

  // Create the application tray.
  appTray = createTray(mainWindow)

  // Add a file watcher to detect new screenshots.
  watcher = installCreatedFileWatcher(TMP_WORKING_DIRECTORY, (createdFilePath) => {
    // TODO Extract fn
    console.log('Created file: ', createdFilePath)

    if (mainWindow) {
      sendToRenderer(mainWindow, 'newScreenshot', createdFilePath)

      mainWindow.show()
      mainWindow.focus()
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
  getIpcMain(ipcMain).handle(
    'newScreenshotOk',
    async (event: IpcMainInvokeEvent, destinationId: DestinationId, filePath: string) => {
      // TODO Extract & do something relevant
      const destination = getDestination(destinationId)

      await destination.share(filePath)

      if (mainWindow?.isVisible()) {
        mainWindow.hide()
      }
    }
  )
}

/**
 * Unregisters IPC handlers for messages from the renderer process.
 */
function unregisterIpcHandlers(): void {
  getIpcMain(ipcMain).removeHandler('newScreenshotOk')
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
 * Triggered when the main window is going to be closed.
 * @param window - The associated window.
 * @param event - The associated event
 */
function onMainWindowClose(event: Electron.Event): void {
  // Hide the window instead of closing it if we're not explicitely quitting.
  if (!isApplicationQuitting) {
    event.preventDefault()

    mainWindow?.hide()
  }
}

/**
 * Triggered when the main window is closed.
 */
function onMainWindowClosed(): void {
  appTray?.destroy()
  appTray = null

  mainWindow = null
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

// Hide security warnings in dev as we are explicitely disabling the `webSecurity` option in dev mode to load images
// from the filesystem while serving the renderer application from an HTTP server.
if (isDev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
}

// Hide the Dock icon.
app.dock.hide()

/**
 * Handle application lifecycle.
 */
app.on('ready', createMainWindow)
app.on('before-quit', onBeforeQuit)
app.on('will-quit', onWillQuit)
