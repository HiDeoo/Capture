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
    destination.getDefaultShareOptions(getDestinationSettingsGetter(destinationId)())
  )

  const onClickCancel = useCallback(() => {
    shiftFromQueue()
  }, [shiftFromQueue])

  const onClickShare = useCallback(async () => {
    try {
      lockUi()

      await destination.share(pendingScreenshot, getDestinationSettingsGetter(destinationId)(), shareOptions)

      addToHistory({ path: pendingScreenshot })

      shiftFromQueue()

      await getIpcRenderer().invoke('closeWindow')
    } catch (error) {
      // TODO Handle errors
      console.log('error ', error)
    } finally {
      lockUi(false)
    }
  }, [
    addToHistory,
    destination,
    destinationId,
    getDestinationSettingsGetter,
    lockUi,
    pendingScreenshot,
    shareOptions,
    shiftFromQueue,
  ])

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
        shareOptions={shareOptions}
        onChangeDestination={onChangeDestination}
        setShareOption={setDestinationShareOption}
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
