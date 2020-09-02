import accept from 'attr-accept'
import { BrowserWindow, Menu, Tray } from 'electron'
import { lookup } from 'mime-types'

import { getMainProcessImagePath } from './paths'

/**
 * Creates a tray icon associated to a window.
 * @param  window - The window to toggle when clicking the tray icon.
 * @param  dropHandler - Function called when accepted files are dropped on the tray icon.
 * @return The tray.
 */
export function createTray(
  window: BrowserWindow,
  dropHandler: (event: undefined, paths: string[]) => Promise<void>
): Tray {
  const tray = new Tray(getMainProcessImagePath('iconTemplate.png'))
  tray.setIgnoreDoubleClickEvents(true)

  tray.on('click', () => {
    onClickTray(window)
  })

  tray.on('right-click', () => {
    tray.popUpContextMenu(Menu.buildFromTemplate([{ label: 'Quit Capture', role: 'quit' }]))
  })

  tray.on('drop-files', (event, files) => {
    const acceptedFiles = files.filter((file) => {
      const type = lookup(file)

      if (!type) {
        return false
      }

      return accept({ name: file, type }, 'image/*')
    })

    if (acceptedFiles.length > 0) {
      void dropHandler(undefined, acceptedFiles)
    }
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
