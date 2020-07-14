import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import { getIpcRenderer } from '../main/ipc'
import { useApp, useHistory, useSettings } from '../store'
import { DestinationId, ShareOptions, ShareOptionValue } from '../utils/Destination'
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
  const [destinationId, setDestinationId] = useState(defaultDestination)
  const destination = getDestination(destinationId)
  const [shareOptions, setShareOptions] = useState<ShareOptions>(
    destination.getDefaultShareOptions ? destination.getDefaultShareOptions() : {}
  )

  const onClickCancel = useCallback(() => {
    shiftFromQueue()
  }, [shiftFromQueue])

  const onClickShare = useCallback(async () => {
    try {
      lockUi()

      await getIpcRenderer().invoke(
        'shareScreenshot',
        destinationId,
        pendingScreenshot,
        toJS(getDestinationSettingsGetter(destinationId)())
      )

      addToHistory({ path: pendingScreenshot })

      shiftFromQueue()
    } catch (error) {
      // TODO Handle errors
      console.log('error ', error)
    } finally {
      lockUi(false)
    }
  }, [addToHistory, destinationId, getDestinationSettingsGetter, lockUi, pendingScreenshot, shiftFromQueue])

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

  const onChangeDestination = useCallback(
    (newDestinationId: DestinationId) => {
      setDestinationId(newDestinationId)
    },
    [setDestinationId]
  )

  const getDestinationShareOptions = useCallback(<
    DestinationShareOptions extends ShareOptions
  >(): DestinationShareOptions => {
    return shareOptions as DestinationShareOptions
  }, [shareOptions])

  const setDestinationShareOption = useCallback(
    <DestinationShareOptions extends ShareOptions>(
      key: KnownKeys<DestinationShareOptions>,
      value: ShareOptionValue
    ): void => {
      setShareOptions({ ...shareOptions, [key]: value })
    },
    [setShareOptions, shareOptions]
  )

  return (
    <>
      <EditorToolBar
        locked={isUiLocked}
        destinationId={destinationId}
        onChangeDestination={onChangeDestination}
        setShareOption={setDestinationShareOption}
        getShareOptions={getDestinationShareOptions}
      />
      <LoadingBar enabled={isUiLocked} />
      <Content>
        <StyledImg src={`file://${pendingScreenshot}`} alt="" />
      </Content>
      <EditorInfoBar locked={isUiLocked} filePath={pendingScreenshot} />
    </>
  )
}

export default observer(Editor)
