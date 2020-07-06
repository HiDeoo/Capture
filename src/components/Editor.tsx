import { observer } from 'mobx-react-lite'
import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { defaultDestination } from './DestinationSelect'
import EditorInfoBar from './EditorInfoBar'
import EditorToolBar from './EditorToolBar'
import { getIpcRenderer } from '../main/ipc'
import { useApp } from '../store'
import { useTitleBar } from './TitleBar'
import TitleBarButton, { IconSymbol } from './TitleBarButton'
import { DestinationId } from '../utils/Destination'

/**
 * Image component.
 */
const Image = styled.img`
  ${tw`border border-solid`}

  border-color: ${theme('editor.border')};
`

/**
 * Editor Component.
 */
const Editor: React.FC<{}> = () => {
  const { setTitleBarContent } = useTitleBar()
  const { pendingScreenshot, shiftFromQueue } = useApp()
  const [destination, setDestination] = useState(defaultDestination)

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

  function onChangeDestination(destinationId: DestinationId): void {
    setDestination(destinationId)
  }

  return (
    <>
      <EditorToolBar onChangeDestination={onChangeDestination} />
      <div css={tw`p-3 h-full overflow-auto`}>
        <Image src={`file://${pendingScreenshot}`} alt="" />
      </div>
      <EditorInfoBar filePath={pendingScreenshot} />
    </>
  )
}

export default observer(Editor)
