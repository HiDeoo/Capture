import React, { useEffect, useState } from 'react'
import type { IpcRendererEvent } from 'electron'

import { getIpcRenderer } from '../main/ipc'
import { WindowType } from '../main/windows'

/**
 * App Component.
 */
const App: React.FC<Props> = (props) => {
  const [screenshotPath, setScreenshotPath] = useState<Optional<string>>()

  useEffect(() => {
    function onNewScreenshot(_event: IpcRendererEvent, path: string): void {
      setScreenshotPath(path)
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

  return (
    <div>
      <div>
        <button onClick={onClickCancel}>Cancel</button>
      </div>
      Hello {props.windowType} - {screenshotPath}
      <br />
      {screenshotPath && <img src={`file://${screenshotPath}`} alt="" />}
    </div>
  )
}

export default App

/**
 * React Props.
 */
interface Props {
  windowType: WindowType
}
