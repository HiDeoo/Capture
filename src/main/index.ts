import { spawn } from 'child_process'
import { app, BrowserWindow, globalShortcut, Tray } from 'electron'
import isDev from 'electron-is-dev'
import type { NSFW } from 'nsfw'
import path from 'path'

import { createTray } from './tray'
import { getElectronPrebuiltPath, getMainWindowRendererUri } from './paths'
import { installCreatedFileWatcher, uninstallFileWatcher } from './watcher'

// TODO Remove
const TMP_WORKING_DIRECTORY = '/Users/hideo/tmp/capture'

/**
 * Main browser window instance.
 */
let mainWindow: BrowserWindow | null = null

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
 * Creates the main window.
 */
async function createMainWindow(): Promise<void> {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    show: false,
    width: 800,
  })

  // Load the renderer application.
  await mainWindow.loadURL(getMainWindowRendererUri())

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

  // Handle window lifecycle.
  mainWindow.on('close', onMainWindowClose)
  mainWindow.on('closed', onMainWindowClosed)

  try {
    watcher = await installCreatedFileWatcher(TMP_WORKING_DIRECTORY, (createdFilePath) => {
      // TODO Do something ^^
      console.log('Created file: ', createdFilePath)
    })
  } catch (error) {
    // TODO Handle errors
    console.log('error ', error)
  }

  registerGlobalShortcuts()
}

/**
 * Registers the application global shortcuts.
 */
function registerGlobalShortcuts(): void {
  try {
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
  // TODO Refactor
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
 * Triggered when the main window is is going to be closed.
 * @param event The associated event
 */
function onMainWindowClose(event: Event): void {
  // Hide the window instead of closing it if we're not explicitely quitting.
  if (!isApplicationQuitting) {
    event.preventDefault()

    if (mainWindow) {
      mainWindow.hide()
    }
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
