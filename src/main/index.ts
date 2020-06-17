import { app, BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'

/**
 * Main browser window.
 */
let browserWindow: BrowserWindow | null = null

/**
 * Create the main browser window.
 */
function createBrowserWindow() {
  browserWindow = new BrowserWindow({
    height: 600,
    width: 800,
  })

  browserWindow.loadURL(isDev ? 'http://localhost:3000/index.html' : `file://${__dirname}/../index.html`)

  /**
   * Triggered when the window is closed.
   */
  browserWindow.on('closed', () => (browserWindow = null))

  if (isDev) {
    browserWindow.webContents.openDevTools()
  }
}

/**
 * Triggered when Electron has finished initializing.
 */
app.on('ready', createBrowserWindow)
