import { spawn } from 'child_process'
import type { FSWatcher } from 'chokidar'
import dateFormat from 'date-fns/format'
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  globalShortcut,
  ipcMain,
  IpcMainInvokeEvent,
  protocol,
  Tray,
} from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'

import { getIpcMain, sendToRenderer } from './ipc'
import { getElectronPrebuiltPath, getRendererUri } from './paths'
import { createTray } from './tray'
import { installCreatedFileWatcher, uninstallFileWatcher } from './watcher'
import { getWindowRendererUri, WindowType } from './windows'

// TODO Remove
const TMP_WORKING_DIRECTORY = '/Users/hideo/tmp/capture'

/**
 * Application browser window instances.
 */
let libraryWindow: BrowserWindow | null = null
let editorWindow: BrowserWindow | null = null

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
 * Application browser window default options.
 */
const windowDefaultOptions: BrowserWindowConstructorOptions = {
  show: false,
  webPreferences: {
    allowRunningInsecureContent: false,
    preload: path.join(__dirname, 'preload'),
    // We disable the `webSecurity` option in dev mode so we can load images from the filesystem while serving the
    // renderer application from an HTTP server.
    // This is not an issue in production as we are serving the renderer application from the filesystem in that case.
    webSecurity: !isDev,
  },
}

/**
 * Creates the library window.
 */
async function createLibraryWindow(): Promise<void> {
  // Create the browser window.
  libraryWindow = new BrowserWindow({
    ...windowDefaultOptions,
    height: 600,
    width: 800,
  })

  // Handle window lifecycle.
  libraryWindow.on('close', (event: Electron.Event) => onWindowClose(libraryWindow, event))
  libraryWindow.on('closed', onWindowClosed)

  // Ensure loading images from the filesystem works as expected.
  protocol.registerFileProtocol('file', (request, callback) => {
    callback(decodeURIComponent(request.url.replace('file:///', '')))
  })

  // Load the application for the library window.
  await loadWindowApp(libraryWindow, WindowType.Library)

  if (isDev) {
    // Enable reloading of the main process in dev mode.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron-reload')(__dirname, {
      electron: getElectronPrebuiltPath(),
      forceHardReset: true,
      hardResetMethod: 'exit',
    })

    // Open the devtools in dev mode.
    libraryWindow.webContents.openDevTools({ mode: 'undocked', activate: false })
  }

  // Create the application tray.
  appTray = createTray(libraryWindow)

  // Add a file watcher to detect new screenshots.
  watcher = installCreatedFileWatcher(TMP_WORKING_DIRECTORY, (createdFilePath) => {
    // TODO Extract fn
    console.log('Created file: ', createdFilePath)

    if (editorWindow) {
      if (!editorWindow.isVisible()) {
        editorWindow?.show()
      }

      editorWindow.focus()

      sendToRenderer(editorWindow, 'newScreenshot', createdFilePath)
    }
  })

  // Create the window used to handle new screenshots.
  await createEditorWindow()

  // Register global shrotcuts.
  registerGlobalShortcuts()

  // Handle IPC messages from the renderer process.
  registerIpcHandlers()
}

/**
 * Creates the editor window.
 */
async function createEditorWindow(): Promise<void> {
  // Create the browser window.
  editorWindow = new BrowserWindow({
    ...windowDefaultOptions,
    height: 200,
    width: 200,
  })

  // Handle window lifecycle.
  editorWindow.on('close', (event: Electron.Event) => onWindowClose(editorWindow, event))
  editorWindow.on('closed', onWindowClosed)

  if (isDev) {
    // Open the devtools in dev mode.
    editorWindow.webContents.openDevTools({ mode: 'undocked', activate: false })
  }

  // Load the application for the editor window.
  await loadWindowApp(editorWindow, WindowType.Editor)
}

/**
 * Loads a window renderer application.
 * @param window - The browser window to use to load the application.
 * @param type - The type of the window.
 */
async function loadWindowApp(window: BrowserWindow, type: WindowType): Promise<void> {
  try {
    return window.loadURL(getWindowRendererUri(getRendererUri(), type))
  } catch (error) {
    // TODO Handle errors
    console.log('error ', error)
  }
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
  getIpcMain(ipcMain).handle('newScreenshotCancel', () => {
    // TODO Extract
    if (editorWindow?.isVisible()) {
      editorWindow.hide()
    }
  })

  getIpcMain(ipcMain).handle('newScreenshotOk', (_event: IpcMainInvokeEvent, filePath: string) => {
    // TODO Extract
    if (editorWindow?.isVisible()) {
      editorWindow.hide()
    }

    // TODO Extract
    if (libraryWindow) {
      if (!libraryWindow.isVisible()) {
        libraryWindow.show()
      }

      libraryWindow.focus()

      sendToRenderer(libraryWindow, 'sharedScreenshot', filePath)
    }
  })
}

/**
 * Unregisters IPC handlers for messages from the renderer process.
 */
function unregisterIpcHandlers(): void {
  getIpcMain(ipcMain).removeHandler('newScreenshotCancel')
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
 * Triggered when a window is going to be closed.
 * @param window - The associated window.
 * @param event - The associated event
 */
function onWindowClose(window: BrowserWindow | null, event: Electron.Event): void {
  // Hide the window instead of closing it if we're not explicitely quitting.
  if (!isApplicationQuitting) {
    event.preventDefault()

    if (window) {
      window.hide()
    }
  }
}

/**
 * Triggered when a window is closed.
 */
function onWindowClosed(): void {
  appTray?.destroy()
  appTray = null

  editorWindow = null
  libraryWindow = null
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
app.on('ready', createLibraryWindow)
app.on('before-quit', onBeforeQuit)
app.on('will-quit', onWillQuit)
