import { app, BrowserWindow, dialog } from 'electron'

/**
 * Handle a fatal error that can't be reported from the renderer process.
 * Note: this should only be used when the application window crashed or is not yet available to report an error.
 * @param message - A message to show to the user.
 * @param error - The internal error.
 * @param window - The application window.
 */
export function handleFatalError(message: string, error: Error, window?: BrowserWindow): void {
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
