import { BrowserWindow, Menu, Tray } from 'electron'

import { getMainProcessImagePath } from './paths'

/**
 * Creates a tray icon associated to a window.
 * @param  window - The window to toggle when clicking the tray icon.
 * @return The tray.
 */
export function createTray(window: BrowserWindow): Tray {
  const tray = new Tray(getMainProcessImagePath('iconTemplate.png'))
  tray.setIgnoreDoubleClickEvents(true)

  tray.on('click', () => {
    onClickTray(window)
  })

  tray.on('right-click', () => {
    tray.popUpContextMenu(Menu.buildFromTemplate([{ label: 'Quit Capture', role: 'quit' }]))
  })

  return tray
}

/**
 * Triggered when the tray icon is clicked.
 * @param window - The window associated to the tray.
 */
function onClickTray(window: BrowserWindow): void {
  if (!window.isVisible() || !window.isFocused()) {
    window.show()
    window.focus()
  } else {
    window.hide()
  }
}
