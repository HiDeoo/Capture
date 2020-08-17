import { app, BrowserWindow, dialog } from 'electron'

import { sendToRenderer } from './ipc'

/**
 * Handle a fatal error that can't be reported from the renderer process.
 * Note: this should only be used when the application window crashed or is not yet available to report an error.
 * @param message - A message to show to the user.
 * @param error - The internal error.
 * @param window - The application window.
 */
export function handleFatalError(message: string, error: Error, window?: BrowserWindow | null): void {
  console.error(error)

  if (window) {
    window.show()
    window.focus()
  }

  dialog.showMessageBoxSync({
    buttons: ['Ok'],
    defaultId: 0,
    detail: message,
    message: 'Something went wrong!',
    type: 'error',
  })

  app.exit(1)
}

/**
 * Handles an error from the main process by reporting it back to the renderer process.
 * @param message - A message to show to the user.
 * @param error - The internal error.
 * @param window - The application window.
 */
export function handleError(message: string, error: Error, window?: BrowserWindow | null): void {
  if (!window) {
    handleFatalError(message, error, window)

    return
  }

  window.show()
  window.focus()

  sendToRenderer(window, 'newError', message, error.stack)
}
