import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'

import { useSettings } from '../store'
import { getIpcRenderer, IpcRendererEvent } from '../main/ipc'

/**
 * Library Component.
 */
const Library: React.FC<{}> = () => {
  const { bumpTest1, test1 } = useSettings()
  const [screenshotPath, setScreenshotPath] = useState<Optional<string>>()

  useEffect(() => {
    function onNewScreenshot(event: IpcRendererEvent, filePath: string): void {
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
      <button onClick={bumpTest1}>Bump</button>
      <div>{test1}</div>
    </div>
  )
}

export default observer(Library)
