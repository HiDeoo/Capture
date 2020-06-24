import type { IpcRendererEvent } from 'electron'
import React, { useEffect, useState } from 'react'

import { getIpcRenderer } from '../main/ipc'

/**
 * Editor Component.
 */
const Editor: React.FC<{}> = () => {
  const [screenshotPath, setScreenshotPath] = useState<Optional<string>>()

  useEffect(() => {
    function onNewScreenshot(_event: IpcRendererEvent, filePath: string): void {
      setScreenshotPath(filePath)
    }

    // TODO Do something relevant
    getIpcRenderer().on('newScreenshot', onNewScreenshot)

    return () => {
      getIpcRenderer().removeListener('newScreenshot', onNewScreenshot)
    }
  })

  async function onClickCancel(): Promise<void> {
    await getIpcRenderer().invoke('newScreenshotCancel')

    setScreenshotPath(undefined)
  }

  async function onClickOk(): Promise<void> {
    if (screenshotPath) {
      await getIpcRenderer().invoke('newScreenshotOk', screenshotPath)

      setScreenshotPath(undefined)
    }
  }

  return (
    <div>
      <button onClick={onClickCancel}>Cancel</button>
      <button onClick={onClickOk} disabled={!screenshotPath}>
        Ok
      </button>
      <div>{screenshotPath}</div>
      {screenshotPath && (
        <div>
          <img src={`file://${screenshotPath}`} alt="" />
        </div>
      )}
    </div>
  )
}

export default Editor
