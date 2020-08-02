import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { SketchField, Tools } from 'react-sketch2'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { usePrevious } from '../utils/react'
import Theme from '../utils/theme'
import Img, { ImageSize } from './Img'
import type { SvgIconName } from './Svg'

const Layers = styled.div`
  ${tw`relative inline-block border border-solid`}

  border-color: ${theme('editor.border')};

  & > img {
    max-height: unset;
    max-width: unset;
  }
`

export const LineWidths: LineWidth[] = [
  { svgIcon: 'lineWidthXs', value: 2 },
  { svgIcon: 'lineWidthSm', value: 4 },
  { svgIcon: 'lineWidthLg', value: 8 },
  { svgIcon: 'lineWidthXl', value: 12 },
  { svgIcon: 'lineWidthXxl', value: 18 },
]

export type ImageEditorAction =
  | { type: 'set_tool'; tool: Optional<Tools> }
  | { type: 'set_line_width'; width: LineWidth }

const imageEditorInitialState: ImageEditorState = {
  lineWidth: LineWidths[1],
  tool: Tools.Select,
}

function imageEditorReducer(state: ImageEditorState, action: ImageEditorAction): ImageEditorState {
  switch (action.type) {
    case 'set_tool': {
      return { ...state, tool: action.tool ?? imageEditorInitialState.tool }
    }
    case 'set_line_width': {
      return { ...state, lineWidth: action.width }
    }
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
  const isSketchInitialized = useRef(false)
  const [imageSize, setImageSize] = useState<Optional<ImageSize>>()
  const readOnlyPreviousTool = useRef(imageEditorInitialState.tool)
  const previous = usePrevious({ lineWidth: imageEditorState.lineWidth, readonly, tool: imageEditorState.tool })

  function setSketchRef(ref: SketchField): void {
    sketch.current = ref

    if (sketch.current && !isSketchInitialized.current) {
      isSketchInitialized.current = true

      // Update the Fabric.js selection handle colors.
      ref._fc.on('selection:created', (event) => {
        event.target.transparentCorners = true
        event.target.borderColor = Theme.color.tint
        event.target.cornerColor = Theme.color.tint
      })
    }
  }

  function onImageLoaded(): void {
    if (image.current) {
      setImageSize({ height: image.current.height, width: image.current.width })
    }
  }

  useEffect(() => {
    if (previous) {
      if (previous.readonly !== readonly) {
        if (readonly) {
          // When the editor is transitionning in readonly mode, we save the current tool (to restore it when disabling
          // the readonly mode) and set the current tool to the default one.
          readOnlyPreviousTool.current = imageEditorState.tool
          imageEditorDispatch({ type: 'set_tool', tool: Tools.DefaultTool })
          requestAnimationFrame(() => {
            if (sketch.current) {
              // We also manually update the canvas cursor so it doesn't indicate that some actions are possible while the
              // editor is in readonly mode.
              sketch.current._fc.defaultCursor = 'default'
            }
          })
        } else {
          // When disabling the readonly mode, restore the previously saved tool that was used before.
          imageEditorDispatch({ type: 'set_tool', tool: readOnlyPreviousTool.current })
        }
      } else if (previous.lineWidth.value !== imageEditorState.lineWidth.value) {
        // When updating the line width, we need to reset the current tool to the default one and immediately restore
        // back the current tool for the line width to be updated.
        imageEditorDispatch({ type: 'set_tool', tool: Tools.DefaultTool })
        requestAnimationFrame(() => {
          imageEditorDispatch({ type: 'set_tool', tool: imageEditorState.tool })
        })
      }
    }
  }, [imageEditorDispatch, imageEditorState.lineWidth, imageEditorState.tool, previous, readonly, sketch])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        // Disable the current tool.
        imageEditorDispatch({ type: 'set_tool', tool: undefined })

        if (sketch.current) {
          // Discard existing selections.
          sketch.current._fc.discardActiveObject()
          sketch.current._fc.renderAll()
        }
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        if (sketch.current) {
          // Remove the selections.
          sketch.current.removeSelected()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  })

  return (
    <Layers>
      <Img src={path} onLoad={onImageLoaded} ref={image} />
      <div css={tw`absolute inset-0`}>
        <SketchField
          lineColor="black"
          ref={setSketchRef}
          width={imageSize?.width}
          height={imageSize?.height}
          tool={imageEditorState.tool}
          lineWidth={imageEditorState.lineWidth.value}
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
  lineWidth: LineWidth
  tool: Optional<Tools>
}

export interface LineWidth {
  svgIcon: SvgIconName
  value: number
}
