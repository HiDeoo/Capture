import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { getIpcRenderer } from '../main/ipc'
import { useApp, useHistory, useSettings } from '../store'
import { DestinationId } from '../utils/Destination'
import { defaultDestination } from './DestinationSelect'
import EditorInfoBar from './EditorInfoBar'
import EditorToolBar from './EditorToolBar'
import Img from './Img'
import LoadingBar from './LoadingBar'
import { useTitleBar } from './TitleBar'
import TitleBarButton, { IconSymbol } from './TitleBarButton'

const Content = styled.div`
  ${tw`h-full overflow-auto`}

  padding: 14px;
  padding-top: 11px;
`

const StyledImg = styled(Img)`
  ${tw`border border-solid`}

  border-color: ${theme('editor.border')};
`

const Editor: React.FC<{}> = () => {
  const { addToHistory } = useHistory()
  const { setTitleBarContent } = useTitleBar()
  const { isUiLocked, lockUi, pendingScreenshot, shiftFromQueue } = useApp()
  const { getDestinationSettingsGetter } = useSettings()
  const [destination, setDestination] = useState(defaultDestination)

  const onClickCancel = useCallback(() => {
    shiftFromQueue()
  }, [shiftFromQueue])

  const onClickShare = useCallback(async () => {
    try {
      lockUi()

      await getIpcRenderer().invoke(
        'shareScreenshot',
        destination,
        pendingScreenshot,
        toJS(getDestinationSettingsGetter(destination)())
      )

      addToHistory({ path: pendingScreenshot })

      shiftFromQueue()
    } catch (error) {
      // TODO Handle errors
      console.log('error ', error)
    } finally {
      lockUi(false)
    }
  }, [addToHistory, destination, getDestinationSettingsGetter, lockUi, pendingScreenshot, shiftFromQueue])

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
        <StyledImg src={`file://${pendingScreenshot}`} alt="" />
      </Content>
      <EditorInfoBar locked={isUiLocked} filePath={pendingScreenshot} />
    </>
  )
}

export default observer(Editor)

interface LoadingBarProps {
  enabled: boolean
}
