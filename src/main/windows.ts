/**
 * The various type of windows supported by the application.
 */
export enum WindowType {
  Main,
  NewScreenshot,
}

/**
 * The name of the query string parameter used to pass down the window type.
 */
const WINDOW_TYPE_PARAM = 'windowType'

/**
 * Returns the URI a window renderer application.
 * @param  appUri - The URI of the application.
 * @param  windowType - The type of the window. This parameter will be passed down as a query string parameter to the
 * renderer process.
 * @return The window renderer application URI.
 */
export function getWindowRendererUri(appUri: string, windowType: WindowType): string {
  const uri = new URL(appUri)
  uri.searchParams.append(WINDOW_TYPE_PARAM, windowType.toString())

  return uri.toString()
}

/**
 * Returns the window type based on a specific renderer application URI.
 * @param  location - A location.
 * @return The window type.
 */
export function getWindowTypeFromUri(location: Location): WindowType {
  const params = new URLSearchParams(location.search)
  const typeStr = params.get(WINDOW_TYPE_PARAM) ?? '0'

  if (typeStr in WindowType) {
    return WindowType[typeStr as keyof typeof WindowType]
  }

  return WindowType.Main
}
