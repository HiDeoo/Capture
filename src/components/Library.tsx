import type { IpcRendererEvent } from 'electron'
import React, { useEffect, useState } from 'react'

import { getIpcRenderer } from '../main/ipc'

/**
 * Library Component.
 */
const Library: React.FC<{}> = () => {
  const [screenshotPath, setScreenshotPath] = useState<Optional<string>>()

  useEffect(() => {
    function onNewScreenshot(_event: IpcRendererEvent, filePath: string): void {
      setScreenshotPath(filePath)
    }

    // TODO Do something relevant
    getIpcRenderer().on('sharedScreenshot', onNewScreenshot)

    return () => {
      getIpcRenderer().removeListener('sharedScreenshot', onNewScreenshot)
    }
  })

  return (
    <div>
      Library
      <div>{screenshotPath}</div>
    </div>
  )
}

export default Library
