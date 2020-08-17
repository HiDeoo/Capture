import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import type { DestinationId, ShareOptions, ShareOptionValue } from '../destinations/DestinationBase'
import { getIpcRenderer } from '../main/ipc'
import { useApp, useHistory, useSettings } from '../store'
import { mergeImages } from '../utils/image'
import type { Color } from './ColorSelect'
import { defaultDestinationId } from './DestinationSelect'
import EditorInfoBar from './EditorInfoBar'
import EditorToolBar from './EditorToolBar'
import { AppError, useErrorHandler } from './ErrorBoundary'
import ImageEditor, { useImageEditor } from './ImageEditor'
import type { ImageDimensions } from './Img'
import LoadingBar from './LoadingBar'
import { useTitleBar } from './TitleBar'
import TitleBarButton, { IconSymbol } from './TitleBarButton'

const Content = styled.div`
  ${tw`flex-1 overflow-auto`}

  padding: 14px;
`

const Editor: React.FC = () => {
  const handleError = useErrorHandler()
  const { addToHistory } = useHistory()
  const { setTitleBarContent } = useTitleBar()
  const { isUiLocked, lockUi, pendingScreenshot, shiftFromQueue } = useApp()
  const { getDestinationSettings, getDestinationSettingsGetter, getDestinationSettingsSetter } = useSettings()
  const { getImageEditorStateProps, imageEditorImage, imageEditorSketch, imageEditorUtils } = useImageEditor()

  const [destinationId, setDestinationId] = useState(defaultDestinationId)

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

      if (!imageEditorImage.current) {
        throw new Error('Missing reference to image editor.')
      }

      let size = pendingScreenshot.size

      const dimensions: ImageDimensions = {
        height: imageEditorImage.current.height,
        width: imageEditorImage.current.width,
      }

      if (imageEditorUtils.hasAnnotations()) {
        const images = imageEditorUtils.getImages()

        if (images) {
          const imageData = mergeImages(images, dimensions.width, dimensions.height)

          size = await getIpcRenderer().invoke('saveImage', pendingScreenshot.path, imageData)
        }
      }

      const response = await destination.share(
        pendingScreenshot.path,
        size,
        dimensions,
        shareOptions,
        getDestinationSettingsGetter(destinationId),
        getDestinationSettingsSetter(destinationId)
      )

      addToHistory(response)

      shiftFromQueue()

      await getIpcRenderer().invoke('closeWindow')
    } catch (error) {
      handleError(new AppError('Something went wrong while sharing the image.', error, true))
    } finally {
      lockUi(false)
    }
  }, [
    addToHistory,
    destination,
    destinationId,
    handleError,
    imageEditorImage,
    imageEditorUtils,
    getDestinationSettingsGetter,
    getDestinationSettingsSetter,
    lockUi,
    pendingScreenshot,
    shareOptions,
    shiftFromQueue,
  ])

  const onChangeDestination = useCallback(
    (newDestinationId: DestinationId) => {
      setDestinationId(newDestinationId)
    },
    [setDestinationId]
  )

  const addText = useCallback(
    (color: Color) => {
      imageEditorUtils.addText(color)
    },
    [imageEditorUtils]
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
        addText={addText}
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
          path={`file://${pendingScreenshot.path}`}
        />
      </Content>
      <EditorInfoBar locked={isUiLocked} path={pendingScreenshot.path} />
    </>
  )
}

export default observer(Editor)
