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
    await getIpcRenderer().invoke('newScreenshotOk')

    shiftFromQueue()
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
