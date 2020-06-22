import isDev from 'electron-is-dev'
import path from 'path'

/**
 * Returns the main window renderer application URI.
 * @return The render application URI.
 */
export function getMainWindowRendererUri(): string {
  return isDev ? 'http://localhost:3000/index.html' : `file://${path.join(__dirname, '..', 'index.html')}`
}

/**
 * Returns the electron prebuilt binary path.
 * Note: this binary should only be used in dev mode.
 * @return The path.
 */
export function getElectronPrebuiltPath(): string {
  return path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron')
}

/**
 * Returns the path to an image using by the main process.
 * @param  image - The image filename.
 * @return The image path.
 */
export function getMainProcessImagePath(image: string): string {
  const extraSegments = isDev ? ['..', 'public'] : []

  return path.join(__dirname, '..', ...extraSegments, 'images', image)
}
