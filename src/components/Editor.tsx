import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import tw, { styled } from 'twin.macro'

import { getDestination } from '../destinations'
import type { DestinationId, ShareOptions, ShareOptionValue } from '../destinations/DestinationBase'
import { getIpcRenderer } from '../main/ipc'
import { useApp, useHistory, useSettings } from '../store'
import { mergeImages } from '../utils/image'
import { getEditorShortcut, useShortcut } from '../utils/keyboard'
import type { Color } from './ColorSelect'
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
  const { isUiLocked, lockUi, pendingScreenshot, pendingScreenshotCount, shiftFromQueue } = useApp()
  const {
    closeWindowAfterShare,
    copyShareUrlToClipboard,
    defaultDestinationId,
    deleteUnsharedScreenshots,
    getDestinationSettings,
    getDestinationSettingsGetter,
    getDestinationSettingsSetter,
  } = useSettings()
  const { getImageEditorStateProps, imageEditorImage, imageEditorSketch, imageEditorUtils } = useImageEditor()

  const [destinationId, setDestinationId] = useState(defaultDestinationId)
  const [imageDimensions, setImageDimensions] = useState<Optional<ImageDimensions>>()

  const destination = getDestination(destinationId)
  const [shareOptions, setShareOptions] = useState<ShareOptions>(
    destination.getDefaultShareOptions(getDestinationSettings(destinationId))
  )

  const cancel = useCallback(async () => {
    try {
      lockUi()

      if (deleteUnsharedScreenshots) {
        await getIpcRenderer().invoke('deleteFile', pendingScreenshot.path)
      }

      shiftFromQueue()
    } catch (error) {
      handleError(new AppError('Something went wrong while deleting the image.', error, true))
    } finally {
      lockUi(false)
    }
  }, [deleteUnsharedScreenshots, handleError, lockUi, pendingScreenshot, shiftFromQueue])

  const share = useCallback(async () => {
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

      if (copyShareUrlToClipboard) {
        await getIpcRenderer().invoke('copyTextToClipboard', response.link)
      }

      if (pendingScreenshotCount === 1 && closeWindowAfterShare) {
        await getIpcRenderer().invoke('closeWindow')
      }
    } catch (error) {
      handleError(new AppError('Something went wrong while sharing the image.', error, true))
    } finally {
      lockUi(false)
    }
  }, [
    addToHistory,
    closeWindowAfterShare,
    copyShareUrlToClipboard,
    destination,
    destinationId,
    handleError,
    imageEditorImage,
    imageEditorUtils,
    getDestinationSettingsGetter,
    getDestinationSettingsSetter,
    lockUi,
    pendingScreenshot,
    pendingScreenshotCount,
    shareOptions,
    shiftFromQueue,
  ])

  const onChangeDestination = useCallback(
    (newDestinationId: DestinationId) => {
      setDestinationId(newDestinationId)
      setShareOptions(getDestination(newDestinationId).getDefaultShareOptions(getDestinationSettings(newDestinationId)))
    },
    [getDestinationSettings, setDestinationId]
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

  useShortcut({
    Enter: onEnterShortcut,
    Escape: onEscapeShortcut,
    NumpadEnter: onEnterShortcut,
  })

  function onEnterShortcut(event: KeyboardEvent): void {
    if (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      void share()
    }
  }

  function onEscapeShortcut(event: KeyboardEvent): void {
    if (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      void cancel()
    }
  }

  useEffect(() => {
    setTitleBarContent(
      <>
        <TitleBarButton
          onClick={cancel}
          disabled={isUiLocked}
          symbol={IconSymbol.XMark}
          tooltip={`Cancel - ${getEditorShortcut('editor_cancel')}`}
        />
        <TitleBarButton
          onClick={share}
          disabled={isUiLocked}
          symbol={IconSymbol.PaperPlane}
          tooltip={`Share - ${getEditorShortcut('editor_share')}`}
        />
      </>
    )

    return () => {
      setTitleBarContent(null)
    }
  }, [cancel, isUiLocked, setTitleBarContent, share])

  function onImageEditorLoaded(dimensions: ImageDimensions): void {
    setImageDimensions(dimensions)
  }

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
          key={pendingScreenshot.path}
          onLoaded={onImageEditorLoaded}
          {...getImageEditorStateProps()}
          path={`file://${pendingScreenshot.path}`}
        />
      </Content>
      <EditorInfoBar
        locked={isUiLocked}
        dimensions={imageDimensions}
        path={pendingScreenshot.path}
        size={pendingScreenshot.size}
      />
    </>
  )
}

export default observer(Editor)
