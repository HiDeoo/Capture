import { observer } from 'mobx-react-lite'
import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { defaultDestination } from './DestinationSelect'
import EditorInfoBar from './EditorInfoBar'
import EditorToolBar from './EditorToolBar'
import LoadingBar from './LoadingBar'
import { getIpcRenderer } from '../main/ipc'
import { useApp } from '../store'
import { useTitleBar } from './TitleBar'
import TitleBarButton, { IconSymbol } from './TitleBarButton'
import { DestinationId } from '../utils/Destination'

/**
 * Content component.
 */
const Content = styled.div`
  ${tw`h-full overflow-auto`}

  padding: 14px;
  padding-top: 11px;
`

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
  const { isUiLocked, lockUi, pendingScreenshot, shiftFromQueue } = useApp()
  const [destination, setDestination] = useState(defaultDestination)

  const onClickCancel = useCallback(() => {
    shiftFromQueue()
  }, [shiftFromQueue])

  const onClickShare = useCallback(async () => {
    try {
      lockUi()

      await getIpcRenderer().invoke('shareScreenshot', destination, pendingScreenshot)

      // TODO
      shiftFromQueue()
    } catch (error) {
      // TODO Handle errors
      console.log('error ', error)
    } finally {
      lockUi(false)
    }
  }, [destination, lockUi, pendingScreenshot, shiftFromQueue])

  useEffect(() => {
    setTitleBarContent(
      <>
        <TitleBarButton disabled={isUiLocked} symbol={IconSymbol.XMark} onClick={onClickCancel} />
        <TitleBarButton disabled={isUiLocked} symbol={IconSymbol.PaperPlane} onClick={onClickShare} />
      </>
    )

    return () => {
      setTitleBarContent(null)
    }
  }, [isUiLocked, onClickCancel, onClickShare, setTitleBarContent])

  function onChangeDestination(destinationId: DestinationId): void {
    setDestination(destinationId)
  }

  return (
    <>
      <EditorToolBar locked={isUiLocked} onChangeDestination={onChangeDestination} />
      <LoadingBar enabled={isUiLocked} />
      <Content>
        <Image src={`file://${pendingScreenshot}`} alt="" />
      </Content>
      <EditorInfoBar locked={isUiLocked} filePath={pendingScreenshot} />
    </>
  )
}

export default observer(Editor)

/**
 * React Props.
 */
interface LoadingBarProps {
  enabled: boolean
}
