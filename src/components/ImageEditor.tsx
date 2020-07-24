import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { SketchField, Tools } from 'react-sketch2'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { usePrevious } from '../utils/react'
import Img, { ImageSize } from './Img'

const Layers = styled.div`
  ${tw`relative inline-block border border-solid`}

  border-color: ${theme('editor.border')};

  & > img {
    max-height: unset;
    max-width: unset;
  }
`

export type ImageEditorAction = { type: 'set_tool'; tool: Optional<Tools> }

const imageEditorInitialState: ImageEditorState = {
  tool: Tools.Select,
}

function imageEditorReducer(state: ImageEditorState, action: ImageEditorAction): ImageEditorState {
  switch (action.type) {
    case 'set_tool':
      return { ...state, tool: action.tool ?? imageEditorInitialState.tool }
    default: {
      throw new Error('Invalid image editor action.')
    }
  }
}

export function useImageEditor(): ImageEditorHook {
  const imageEditorSketch = useRef<SketchField>()
  const imageEditorImage = useRef<HTMLImageElement>(null)

  const [imageEditorState, imageEditorDispatch] = useReducer<typeof imageEditorReducer>(
    imageEditorReducer,
    imageEditorInitialState
  )

  const imageEditorUtils = useMemo(
    () => ({
      hasAnnotations(): boolean {
        if (!imageEditorSketch.current) {
          return false
        }

        const json = imageEditorSketch.current.toJSON()

        return json.objects.length > 0
      },
      getImages(): Optional<CanvasImageSource[]> {
        if (!imageEditorImage.current || !imageEditorSketch.current) {
          return
        }

        return [imageEditorImage.current, imageEditorSketch.current._fc.toCanvasElement(window.devicePixelRatio)]
      },
    }),
    []
  )

  return {
    getImageEditorStateProps: () => ({ imageEditorDispatch, imageEditorState }),
    imageEditorImage,
    imageEditorSketch,
    imageEditorUtils,
  }
}

const ImageEditor: React.FC<Props> = ({ image, imageEditorDispatch, imageEditorState, path, readonly, sketch }) => {
  const [imageSize, setImageSize] = useState<Optional<ImageSize>>()
  const readOnlyPreviousTool = useRef(imageEditorInitialState.tool)
  const previous = usePrevious({ readonly, tool: imageEditorState.tool })

  function setSketchRef(ref: SketchField): void {
    sketch.current = ref
  }

  function onImageLoaded(): void {
    if (image.current) {
      setImageSize({ height: image.current.height, width: image.current.width })
    }
  }

  useEffect(() => {
    if (previous && previous.readonly !== readonly) {
      if (readonly) {
        readOnlyPreviousTool.current = imageEditorState.tool
        imageEditorDispatch({ type: 'set_tool', tool: Tools.DefaultTool })
        requestAnimationFrame(() => {
          if (sketch.current) {
            sketch.current._fc.defaultCursor = 'default'
          }
        })
      } else {
        imageEditorDispatch({ type: 'set_tool', tool: readOnlyPreviousTool.current })
      }
    }
  }, [imageEditorDispatch, imageEditorState.tool, previous, readonly, sketch])

  return (
    <Layers>
      <Img src={path} onLoad={onImageLoaded} ref={image} />
      <div css={tw`absolute inset-0`}>
        <SketchField
          lineWidth={3}
          lineColor="black"
          ref={setSketchRef}
          width={imageSize?.width}
          height={imageSize?.height}
          tool={imageEditorState.tool}
        />
      </div>
    </Layers>
  )
}

interface Props extends ImageEditorStateProps {
  image: ImageEditorHook['imageEditorImage']
  path: string
  readonly: boolean
  sketch: ImageEditorHook['imageEditorSketch']
}

export default ImageEditor

interface ImageEditorHook {
  getImageEditorStateProps: () => ImageEditorStateProps
  imageEditorImage: React.RefObject<HTMLImageElement>
  imageEditorSketch: React.MutableRefObject<SketchField | undefined>
  imageEditorUtils: {
    getImages: () => Optional<CanvasImageSource[]>
    hasAnnotations: () => boolean
  }
}

export interface ImageEditorStateProps {
  imageEditorDispatch: React.Dispatch<ImageEditorAction>
  imageEditorState: ImageEditorState
}

export interface ImageEditorState {
  tool: Optional<Tools>
}
