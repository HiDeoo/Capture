import { app, BrowserWindow, Tray } from 'electron'
import isDev from 'electron-is-dev'

import { createTray } from './tray'
import { getElectronPrebuiltPath, getMainWindowRendererUri } from './paths'

/**
 * Main browser window instance.
 */
let mainWindow: BrowserWindow | null = null

/**
 * Application tray instance.
 */
let appTray: Tray | null

/**
 * Defines if the application is explicitely quitting (eg. Cmd+Q on macOS).
 */
let isApplicationQuitting = false

/**
 * Creates the main window.
 */
function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    show: false,
    width: 800,
  })

  // Load the renderer application.
  mainWindow.loadURL(getMainWindowRendererUri())

  if (isDev) {
    // Enable reloading of the main process in dev mode.
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
}

/**
 * Triggered when the main window is is going to be closed.
 * @param event The associated event
 */
function onMainWindowClose(event: Event) {
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
function onMainWindowClosed() {
  appTray?.destroy()
  appTray = null

  mainWindow = null
}

/**
 * Triggered before the application starts closing its windows.
 */
function onBeforeQuit() {
  isApplicationQuitting = true
}

// Hide the Dock icon.
app.dock.hide()

/**
 * Handle application lifecycle.
 */
app.on('ready', createMainWindow)
app.on('before-quit', onBeforeQuit)
