import { observer } from 'mobx-react-lite'
import React from 'react'

import { getIpcRenderer } from '../main/ipc'
import { useApp } from '../store'

/**
 * Editor Component.
 */
const Editor: React.FC<{}> = () => {
  const { pendingScreenshot, shiftFromQueue } = useApp()

  function onClickCancel(): void {
    shiftFromQueue()
  }

  async function onClickOk(): Promise<void> {
    try {
      await getIpcRenderer().invoke('newScreenshotOk', pendingScreenshot)

      // TODO
      shiftFromQueue()
    } catch (error) {
      // TODO Handle errors
      console.log('error ', error)
    }
  }

  return (
    <div>
      <button onClick={onClickCancel}>Cancel</button>
      <button onClick={onClickOk}>Ok</button>
      <div>{pendingScreenshot}</div>
      <div>
        <img src={`file://${pendingScreenshot}`} alt="" />
      </div>
    </div>
  )
}

export default observer(Editor)
