import { observer } from 'mobx-react-lite'
import React, { useState, useEffect, useCallback } from 'react'
import 'styled-components/macro'
import tw from 'tailwind.macro'

import { getDestinations } from '../destinations'
import { getIpcRenderer } from '../main/ipc'
import Select from './Select'
import { useApp } from '../store'
import { useTitleBar } from './TitleBar'
import TitleBarButton, { IconSymbol } from './TitleBarButton'

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

  const onClickCancel = useCallback(() => {
    shiftFromQueue()
  }, [shiftFromQueue])

  const onClickShare = useCallback(async () => {
    try {
      await getIpcRenderer().invoke('shareScreenshot', destination, pendingScreenshot)

      // TODO
      shiftFromQueue()
    } catch (error) {
      // TODO Handle errors
      console.log('error ', error)
    }
  }, [shiftFromQueue, destination, pendingScreenshot])

  useEffect(() => {
    setTitleBarContent(
      <>
        <TitleBarButton symbol={IconSymbol.XMark} onClick={onClickCancel} />
        <TitleBarButton symbol={IconSymbol.PaperPlane} onClick={onClickShare} />
      </>
    )

    return () => {
      setTitleBarContent(null)
    }
  }, [setTitleBarContent, onClickCancel, onClickShare])

  function onChangeSelect(event: React.ChangeEvent<HTMLSelectElement>): void {
    setDestination(event.target.value)
  }

  return (
    <>
      <div>bar</div>
      <div css={tw`px-3 py-2 bg-red-900 overflow-y-auto`}>
        <div>
          <Select options={destinationOptions} onChange={onChangeSelect} />
        </div>
        <div>{pendingScreenshot}</div>
        <div>
          <img src={`file://${pendingScreenshot}`} alt="" />
        </div>
        <div>
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          test
          <br />
          end
        </div>
      </div>
    </>
  )
}

export default observer(Editor)
