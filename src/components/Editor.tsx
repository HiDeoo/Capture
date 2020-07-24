import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import type { DestinationId, ShareOptions, ShareOptionValue } from '../destinations/DestinationBase'
import { getIpcRenderer } from '../main/ipc'
import { useApp, useHistory, useSettings } from '../store'
import { mergeImages } from '../utils/image'
import { defaultDestination } from './DestinationSelect'
import EditorInfoBar from './EditorInfoBar'
import EditorToolBar from './EditorToolBar'
import ImageEditor, { useImageEditor } from './ImageEditor'
import LoadingBar from './LoadingBar'
import { useTitleBar } from './TitleBar'
import TitleBarButton, { IconSymbol } from './TitleBarButton'

const Content = styled.div`
  ${tw`flex-1 overflow-auto`}

  padding: 14px;
`

const Editor: React.FC<{}> = () => {
  const { addToHistory } = useHistory()
  const { setTitleBarContent } = useTitleBar()
  const { isUiLocked, lockUi, pendingScreenshotPath, shiftFromQueue } = useApp()
  const { getDestinationSettings, getDestinationSettingsGetter, getDestinationSettingsSetter } = useSettings()
  const { getImageEditorStateProps, imageEditorImage, imageEditorSketch, imageEditorUtils } = useImageEditor()

  const [destinationId, setDestinationId] = useState(defaultDestination)

  const destination = getDestination(destinationId)
  const [shareOptions, setShareOptions] = useState<ShareOptions>(
    destination.getDefaultShareOptions(getDestinationSettings(destinationId))
  )

  const onClickCancel = useCallback(() => {
    shiftFromQueue()
  }, [shiftFromQueue])

  const onClickShare = useCallback(async () => {
    try {
      lockUi()

      if (imageEditorUtils.hasAnnotations()) {
        const images = imageEditorUtils.getImages()

        if (images && imageEditorImage.current) {
          const imageData = mergeImages(images, imageEditorImage.current.width, imageEditorImage.current.height)

          await getIpcRenderer().invoke('saveImage', pendingScreenshotPath, imageData)
        }
      }

      const response = await destination.share(
        pendingScreenshotPath,
        shareOptions,
        getDestinationSettingsGetter(destinationId),
        getDestinationSettingsSetter(destinationId)
      )

      addToHistory(response)

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
    imageEditorImage,
    imageEditorUtils,
    getDestinationSettingsGetter,
    getDestinationSettingsSetter,
    lockUi,
    pendingScreenshotPath,
    shareOptions,
    shiftFromQueue,
  ])

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

  return (
    <>
      <LoadingBar enabled={isUiLocked} />
      <EditorToolBar
        locked={isUiLocked}
        shareOptions={shareOptions}
        destinationId={destinationId}
        {...getImageEditorStateProps()}
        onChangeDestination={onChangeDestination}
        setShareOption={setDestinationShareOption}
      />
      <Content>
        <ImageEditor
          readonly={isUiLocked}
          image={imageEditorImage}
          sketch={imageEditorSketch}
          {...getImageEditorStateProps()}
          path={`file://${pendingScreenshotPath}`}
        />
      </Content>
      <EditorInfoBar locked={isUiLocked} path={pendingScreenshotPath} />
    </>
  )
}

export default observer(Editor)
