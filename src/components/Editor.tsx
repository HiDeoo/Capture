import { observer } from 'mobx-react-lite'
import React, { useState, useEffect } from 'react'

import { getDestinations } from '../destinations'
import { getIpcRenderer } from '../main/ipc'
import Select from './Select'
import { useApp } from '../store'
import { useTitleBar } from './TitleBar'

/**
 * List of destinations options to use in a <Select />
 */
const destinationOptions = Object.entries(getDestinations()).map(([id, destination]) => {
  return {
    label: destination.getConfiguration().name,
    value: id,
  }
})

/**
 * Editor Component.
 */
const Editor: React.FC<{}> = () => {
  const { setTitleBarContent } = useTitleBar()
  const { pendingScreenshot, shiftFromQueue } = useApp()
  const [destination, setDestination] = useState(destinationOptions[0].value)

  useEffect(() => {
    setTitleBarContent(<div>In Editor</div>)

    return () => {
      setTitleBarContent(null)
    }
  }, [setTitleBarContent])

  function onClickCancel(): void {
    shiftFromQueue()
  }

  async function onClickOk(): Promise<void> {
    try {
      await getIpcRenderer().invoke('shareScreenshot', destination, pendingScreenshot)

      // TODO
      shiftFromQueue()
    } catch (error) {
      // TODO Handle errors
      console.log('error ', error)
    }
  }

  function onChangeSelect(event: React.ChangeEvent<HTMLSelectElement>): void {
    setDestination(event.target.value)
  }

  return (
    <>
      <button onClick={onClickCancel}>Cancel</button>
      <button onClick={onClickOk}>Ok</button>
      <div>
        <Select options={destinationOptions} onChange={onChangeSelect} />
      </div>
      <div>{pendingScreenshot}</div>
      <div>
        <img src={`file://${pendingScreenshot}`} alt="" />
      </div>
    </>
  )
}

export default observer(Editor)
