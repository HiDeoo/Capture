import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'

import Editor from './Editor'
import Library from './Library'
import { getIpcRenderer, IpcRendererEvent } from '../main/ipc'
import { useApp } from '../store'

/**
 * App Component.
 */
const App: React.FC<{}> = (props) => {
  const { pushToQueue, shouldShowEditor } = useApp()

  useEffect(() => {
    function onNewScreenshot(event: IpcRendererEvent, filePath: string): void {
      pushToQueue(filePath)
    }

    getIpcRenderer().on('newScreenshot', onNewScreenshot)

    return () => {
      getIpcRenderer().removeListener('newScreenshot', onNewScreenshot)
    }
  })

  return shouldShowEditor ? <Editor /> : <Library />
}

export default observer(App)
