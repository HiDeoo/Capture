import { app, clipboard, dialog, IpcMainInvokeEvent, nativeImage, shell } from 'electron'
import { constants, promises as fs } from 'fs'
import os from 'os'
import path from 'path'

import { handleError } from './errors'

/**
 * Asks the user to choose a directory.
 * @param  message - A message to optionally display in the directory picker window.
 * @return The directory picked or `undefined` if the user cancelled the operation.
 */
export async function chooseDirectory(event: IpcMainInvokeEvent, message?: string): Promise<Optional<string>> {
  const result = await dialog.showOpenDialog({
    defaultPath: app.getPath('home'),
    properties: ['openDirectory', 'createDirectory', 'promptToCreate', 'dontAddToRecent'],
    message,
  })

  if (result.filePaths.length === 1) {
    return result.filePaths[0]
  }

  return
}

/**
 * Copies text to the clipboard.
 * @param text - The text to copy.
 */
export function copyTextToClipboard(event: IpcMainInvokeEvent, text: string): void {
  clipboard.writeText(text)
}

/**
 * Copies an image to the clipboard.
 * @param filePath - The image path.
 */
export function copyImageToClipboard(event: IpcMainInvokeEvent, filePath: string): void {
  clipboard.writeImage(nativeImage.createFromPath(filePath))
}

/**
 * Deletes a file.
 * @param filePath - The path of the file.
 */
export async function deleteFile(event: IpcMainInvokeEvent, filePath: string): Promise<void> {
  return fs.unlink(filePath)
}

/**
 * Returns informations used in bug reports.
 * @return The informations.
 */
export function getBugReportInfos(): { os: string } {
  return { os: `${os.type()} ${os.release()}` }
}

/**
 * Creates if needed and returns the default screenshot directory path.
 * @return The default screenshot directory path.
 */
export async function getDefaultScreenshotDirectory(): Promise<string> {
  const documentsPath = app.getPath('documents')
  const defaultScreenshotDirectory = path.join(documentsPath, 'Capture')

  try {
    await fs.access(defaultScreenshotDirectory, constants.W_OK)
  } catch {
    try {
      await fs.mkdir(defaultScreenshotDirectory)
    } catch (error) {
      handleError(`The default screenshot directory (${defaultScreenshotDirectory}) could not be created.`, error)
    }
  }

  return defaultScreenshotDirectory
}

/**
 * Opens a file using the default associated application.
 * @param  filePath - The file path.
 * @return A non-empty string if an error occured.
 */
export async function openFile(event: IpcMainInvokeEvent, filePath: string): Promise<string> {
  return shell.openPath(filePath)
}

/**
 * Opens an URL using the default associated application.
 * @param  filePath - The URL to open.
 */
export async function openUrl(event: IpcMainInvokeEvent, url: string): Promise<void> {
  return shell.openExternal(url)
}

/**
 * Quits the application.
 */
export function quit(): void {
  app.quit()
}

/**
 * Saves an image on disk and returns its new size.
 * @param  filePath - The image path.
 * @param  data - The image date.
 * @return The new image size.
 */
export async function saveImage(event: IpcMainInvokeEvent, filePath: string, data: string): Promise<number> {
  await fs.writeFile(filePath, data, { encoding: 'base64' })

  const stat = await fs.stat(filePath)

  return stat.size
}

/**
 * Returns if the app is configured to be opened at login.
 * @return `true` when opened at login time.
 */
export function getOpenAtLogin(): boolean {
  return app.getLoginItemSettings().openAtLogin
}

/**
 * Sets if the application should be opened at login.
 * @param open - `true` when opened at login time.
 */
export function setOpenAtLogin(event: IpcMainInvokeEvent, open: boolean): void {
  app.setLoginItemSettings({ openAtLogin: open })
}
