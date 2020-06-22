import { spawn } from 'child_process'
import { app, BrowserWindow, BrowserWindowConstructorOptions, globalShortcut, Tray } from 'electron'
import isDev from 'electron-is-dev'
import type { NSFW } from 'nsfw'
import path from 'path'

import { createTray } from './tray'
import { getElectronPrebuiltPath, getRendererUri } from './paths'
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
let watcher: Optional<NSFW>

/**
 * Defines if the application is explicitely quitting (eg. Cmd+Q on macOS).
 */
let isApplicationQuitting = false

/**
 * Application browser window default options.
 */
const windowDefaultOptions: BrowserWindowConstructorOptions = {
  show: false,
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

  try {
    // Add a file watcher to detect new screenshots.
    watcher = await installCreatedFileWatcher(TMP_WORKING_DIRECTORY, (createdFilePath) => {
      // TODO Do something ^^
      // TODO Extract fn
      console.log('Created file: ', createdFilePath)
    })
  } catch (error) {
    // TODO Handle errors
    console.log('error ', error)
  }

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

// Hide the Dock icon.
app.dock.hide()

/**
 * Handle application lifecycle.
 */
app.on('ready', createMainWindow)
app.on('before-quit', onBeforeQuit)
app.on('will-quit', onWillQuit)
