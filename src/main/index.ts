import { app, BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'

/**
 * Main browser window.
 */
let browserWindow: BrowserWindow | null = null

/**
 * Create the main browser window.
 */
function createBrowserWindow() {
  // Create the main window.
  browserWindow = new BrowserWindow({
    height: 600,
    width: 800,
  })

  // Load the renderer application.
  browserWindow.loadURL(isDev ? 'http://localhost:3000/index.html' : `file://${__dirname}/../index.html`)

  if (isDev) {
    // Enable reloading of the main process in dev mode.
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      forceHardReset: true,
      hardResetMethod: 'exit',
    })

    // Open the devtools in dev mode.
    browserWindow.webContents.openDevTools()
  }

  /**
   * Triggered when the window is closed.
   */
  browserWindow.on('closed', () => (browserWindow = null))
}

/**
 * Triggered when Electron has finished initializing.
 */
app.on('ready', createBrowserWindow)
