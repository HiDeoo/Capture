import { BrowserWindow, Tray } from 'electron'

import { getMainProcessImagePath } from './paths'

/**
 * Creates a tray icon associated to a window.
 * @param  window The window to toggle when clicking the tray icon.
 * @return The tray.
 */
export function createTray(window: BrowserWindow): Tray {
  const tray = new Tray(getMainProcessImagePath('iconTemplate.png'))
  tray.setIgnoreDoubleClickEvents(true)

  tray.on('click', () => {
    onClickTray(window)
  })

  return tray
}

/**
 * Triggered when the tray icon is clicked.
 * @param window The window associated to the tray.
 */
function onClickTray(window: BrowserWindow) {
  if (window.isVisible()) {
    window.hide()
  } else {
    window.show()
    window.focus()
  }
}
