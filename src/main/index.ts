import { spawn } from 'child_process'
import type { FSWatcher } from 'chokidar'
import { app, BrowserWindow, BrowserWindowConstructorOptions, globalShortcut, protocol, Tray } from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'

import { sendToRenderer } from './ipc'
import { getElectronPrebuiltPath, getRendererUri } from './paths'
import { createTray } from './tray'
import { installCreatedFileWatcher, uninstallFileWatcher } from './watcher'
import { getWindowRendererUri, WindowType } from './windows'

// TODO Remove
const TMP_WORKING_DIRECTORY = '/Users/hideo/tmp/capture'

/**
 * Application browser window instances.
 */
let mainWindow: BrowserWindow | null = null
let newScreenshotWindow: BrowserWindow | null = null

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
 * Creates the main window.
 */
async function createMainWindow(): Promise<void> {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...windowDefaultOptions,
    height: 600,
    width: 800,
  })

  // Handle window lifecycle.
  mainWindow.on('close', (event: Electron.Event) => onWindowClose(mainWindow, event))
  mainWindow.on('closed', onWindowClosed)

  // Ensure loading images from the filesystem works as expected.
  protocol.registerFileProtocol('file', (request, callback) => {
    callback(request.url.replace('file:///', ''))
  })

  // Load the application for the main window.
  await loadWindowApp(mainWindow, WindowType.Main)

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

    if (newScreenshotWindow) {
      if (!newScreenshotWindow.isVisible()) {
        newScreenshotWindow?.show()
      }

      newScreenshotWindow.focus()

      sendToRenderer(newScreenshotWindow, 'newScreenshot', createdFilePath)
    }
  })

  // Create the window used to handle new screenshots.
  await createScreenshotWindow()

  // Register global shrotcuts.
  registerGlobalShortcuts()
}

/**
 * Creates the new screenshot window.
 */
async function createScreenshotWindow(): Promise<void> {
  // Create the browser window.
  newScreenshotWindow = new BrowserWindow({
    ...windowDefaultOptions,
    height: 200,
    width: 200,
  })

  // Handle window lifecycle.
  newScreenshotWindow.on('close', (event: Electron.Event) => onWindowClose(newScreenshotWindow, event))
  newScreenshotWindow.on('closed', onWindowClosed)

  if (isDev) {
    // Open the devtools in dev mode.
    newScreenshotWindow.webContents.openDevTools({ mode: 'undocked', activate: false })
  }

  // Load the application for the new screenshot window.
  await loadWindowApp(newScreenshotWindow, WindowType.NewScreenshot)
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
 * Triggered when the global screenshot shortcut is pressed.
 */
function onScreenshotShortcut(): void {
  // TODO Refactor & extract (maybe extract all shortcuts code)
  const child = spawn('screencapture', ['-i', '-o', path.join(TMP_WORKING_DIRECTORY, 'test.png')])

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

  newScreenshotWindow = null
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
