import { app, BrowserWindow, Tray } from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'

import { createTray } from './tray'

/**
 * Main browser window instance.
 */
let mainWindow: BrowserWindow | null = null

/**
 * Application tray instance.
 */
let appTray: Tray | null

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
  mainWindow.loadURL(isDev ? 'http://localhost:3000/index.html' : `file://${path.join(__dirname, '..', 'index.html')}`)

  if (isDev) {
    // Enable reloading of the main process in dev mode.
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      forceHardReset: true,
      hardResetMethod: 'exit',
    })

    // Open the devtools in dev mode.
    mainWindow.webContents.openDevTools({ mode: 'undocked', activate: false })
  }

  // Create the application tray.
  appTray = createTray(mainWindow)

  // Handle window lifecycle.
  mainWindow.on('closed', onMainWindowClosed)
}

/**
 * Triggered when the main window is closed.
 */
function onMainWindowClosed() {
  appTray?.destroy()
  appTray = null

  mainWindow = null
}

// Hide the Dock icon.
app.dock.hide()

/**
 * Triggered when Electron has finished initializing.
 */
app.on('ready', createMainWindow)
