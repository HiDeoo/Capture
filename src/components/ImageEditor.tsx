import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { SelectionCreatedEvent, SketchField, Tools } from 'react-sketch2'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import { useShortcut } from '../utils/keyboard'
import { usePrevious } from '../utils/react'
import Theme from '../utils/theme'
import { Color, COLORS } from './ColorSelect'
import Img, { ImageDimensions } from './Img'
import type { SvgIconName } from './Svg'

const Layers = styled.div`
  ${tw`relative inline-block border border-solid`}

  border-color: ${theme('editor.border')};

  & > img {
    max-height: unset;
    max-width: unset;
  }
`

export enum CustomTools {
  Redact = 'redact',
}

export const LINE_WIDTHS: LineWidth[] = [
  { svgIcon: 'lineWidthXs', value: 2 },
  { svgIcon: 'lineWidthSm', value: 4 },
  { svgIcon: 'lineWidthLg', value: 8 },
  { svgIcon: 'lineWidthXl', value: 12 },
  { svgIcon: 'lineWidthXxl', value: 18 },
]

export type ImageEditorAction =
  | { type: 'set_tool'; tool: Optional<EditorTools>; self?: boolean }
  | { type: 'set_line_width'; width: LineWidth }
  | { type: 'set_line_color'; color: Color }
  | { type: 'set_fill_color'; color: Optional<Color> }

const imageEditorInitialState: ImageEditorState = {
  _self: false,
  fillColor: undefined,
  lineColor: COLORS[0],
  lineWidth: LINE_WIDTHS[1],
  tool: Tools.Select,
}

function imageEditorReducer(state: ImageEditorState, action: ImageEditorAction): ImageEditorState {
  switch (action.type) {
    case 'set_tool': {
      return { ...state, tool: action.tool ?? imageEditorInitialState.tool, _self: action.self ?? false }
    }
    case 'set_line_width': {
      return { ...state, lineWidth: action.width }
    }
    case 'set_line_color': {
      return { ...state, lineColor: action.color }
    }
    case 'set_fill_color': {
      return { ...state, fillColor: action.color }
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
      addText(color: Color): void {
        if (imageEditorSketch.current) {
          imageEditorSketch.current.addText('Text', { fill: color, fontFamily: 'BlinkMacSystemFont', fontSize: 35 })
        }
      },
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

const ImageEditor: React.FC<Props> = ({
  image,
  imageEditorDispatch,
  imageEditorState,
  onLoaded,
  path,
  readonly,
  sketch,
}) => {
  const [isEditingText, setIsEditingText] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<Optional<ImageDimensions>>()
  const readOnlyPreviousTool = useRef(imageEditorInitialState.tool)
  const previous = usePrevious({
    fillColor: imageEditorState.fillColor,
    lineWidth: imageEditorState.lineWidth,
    readonly,
    tool: imageEditorState.tool,
  })

  function setSketchRef(ref: SketchField): void {
    sketch.current = ref
  }

  function onImageLoaded(): void {
    if (image.current) {
      const dimensions = { height: image.current.height, width: image.current.width }

      setImageDimensions(dimensions)
      onLoaded(dimensions)
    }
  }

  useEffect(() => {
    if (previous) {
      if (previous.readonly !== readonly) {
        if (readonly) {
          // When the editor is transitionning in readonly mode, we save the current tool (to restore it when disabling
          // the readonly mode) and set the current tool to the default one.
          readOnlyPreviousTool.current = imageEditorState.tool
          imageEditorDispatch({ type: 'set_tool', tool: Tools.DefaultTool, self: true })
          requestAnimationFrame(() => {
            if (sketch.current) {
              // We also manually update the canvas cursor so it doesn't indicate that some actions are possible while the
              // editor is in readonly mode.
              sketch.current._fc.defaultCursor = 'default'
            }
          })
        } else {
          // When disabling the readonly mode, restore the previously saved tool that was used before.
          imageEditorDispatch({ type: 'set_tool', tool: readOnlyPreviousTool.current, self: true })
        }
      } else if (
        previous.lineWidth.value !== imageEditorState.lineWidth.value ||
        previous.fillColor !== imageEditorState.fillColor ||
        (previous.tool !== CustomTools.Redact &&
          imageEditorState.tool === CustomTools.Redact &&
          imageEditorState._self === false) ||
        (previous.tool === CustomTools.Redact &&
          imageEditorState.tool !== CustomTools.Redact &&
          imageEditorState._self === false)
      ) {
        // When updating the line width or fill color (which is something also happening when the redact tool is used),
        // we need to reset the current tool to the default one and immediately restore back the current tool for the
        // changes to take effect.
        imageEditorDispatch({ type: 'set_tool', tool: Tools.DefaultTool, self: true })
        requestAnimationFrame(() => {
          imageEditorDispatch({ type: 'set_tool', tool: imageEditorState.tool, self: true })
        })
      }
    }
  }, [
    imageEditorDispatch,
    imageEditorState.fillColor,
    imageEditorState.lineWidth,
    imageEditorState.tool,
    imageEditorState._self,
    previous,
    readonly,
    sketch,
  ])

  useEffect(() => {
    function onEnterTextEditing(): void {
      setIsEditingText(true)
    }

    function onExitTextEditing(): void {
      setIsEditingText(false)

      // Discard existing selections.
      discardSelections()
    }

    function onSelectionCreated(event: SelectionCreatedEvent): void {
      // Update the Fabric.js selection handle colors.
      event.target.transparentCorners = true
      event.target.borderColor = Theme.color.tint
      event.target.cornerColor = Theme.color.tint
    }

    if (sketch.current) {
      sketch.current._fc.on('selection:created', onSelectionCreated)
      sketch.current._fc.on('text:editing:entered', onEnterTextEditing)
      sketch.current._fc.on('text:editing:exited', onExitTextEditing)
    }

    return () => {
      if (sketch.current) {
        sketch.current._fc.off('selection:created', onSelectionCreated)
        sketch.current._fc.off('text:editing:entered', onEnterTextEditing)
        sketch.current._fc.off('text:editing:exited', onExitTextEditing)
      }
    }
  })

  useShortcut({
    Backspace: onBackspaceOrDeleteShortcut,
    Delete: onBackspaceOrDeleteShortcut,
    Digit1: onDigitShortcut,
    Digit2: onDigitShortcut,
    Digit3: onDigitShortcut,
    Digit4: onDigitShortcut,
    Digit5: onDigitShortcut,
    Digit6: onDigitShortcut,
    Escape: onEscapeShortcut,
  })

  useShortcut({ z: onUndoRedoShortcut }, { useCode: false })

  function onUndoRedoShortcut(event: KeyboardEvent): void {
    if (!sketch.current || event.ctrlKey || event.altKey || !event.metaKey) {
      return
    }

    if (event.shiftKey && sketch.current.canRedo()) {
      sketch.current.redo()
    } else if (!event.shiftKey && sketch.current.canUndo()) {
      sketch.current.undo()
    }
  }

  function onBackspaceOrDeleteShortcut(): void {
    // Backspace & delete should be usable when editing text.
    if (isEditingText || readonly) {
      return
    }

    if (sketch.current) {
      // Remove the selections.
      sketch.current.removeSelected()
    }
  }

  function onDigitShortcut(event: KeyboardEvent): void {
    // This should not impact text editing.
    if (isEditingText || readonly) {
      return
    }

    switch (event.code) {
      case 'Digit1': {
        toggleTool(Tools.Pencil)
        break
      }
      case 'Digit2': {
        toggleTool(Tools.Arrow)
        break
      }
      case 'Digit3': {
        toggleTool(Tools.Rectangle)
        break
      }
      case 'Digit4': {
        toggleTool(Tools.Circle)
        break
      }
      case 'Digit5': {
        toggleTool(Tools.Line)
        break
      }
      case 'Digit6': {
        toggleTool(CustomTools.Redact)
        break
      }
    }
  }

  function toggleTool(tool: EditorTools): void {
    if (imageEditorState.tool === tool) {
      imageEditorDispatch({ type: 'set_tool', tool: undefined })
    } else {
      imageEditorDispatch({ type: 'set_tool', tool })
    }
  }

  function onEscapeShortcut(): void {
    if (readonly) {
      return
    }

    // Disable the current tool.
    imageEditorDispatch({ type: 'set_tool', tool: undefined })

    // Discard existing selections.
    discardSelections()
  }

  function discardSelections(): void {
    if (sketch.current) {
      sketch.current._fc.discardActiveObject()
      sketch.current._fc.renderAll()
    }
  }

  function getSketchFieldProps(): { fillColor?: string; lineColor: string; lineWidth: number; tool: Tools } {
    const fillColor = isNativeTool(imageEditorState.tool) ? imageEditorState.fillColor : COLORS[COLORS.length - 1]
    const lineWidth = isNativeTool(imageEditorState.tool) ? imageEditorState.lineWidth.value : 0
    const tool = isNativeTool(imageEditorState.tool) ? imageEditorState.tool : Tools.Rectangle

    return {
      fillColor,
      lineColor: imageEditorState.lineColor,
      lineWidth,
      tool,
    }
  }

  return (
    <Layers>
      <Img src={path} onLoad={onImageLoaded} ref={image} />
      <div tw="absolute inset-0">
        <SketchField
          ref={setSketchRef}
          width={imageDimensions?.width}
          height={imageDimensions?.height}
          {...getSketchFieldProps()}
        />
      </div>
    </Layers>
  )
}

/**
 * Checks if a tool is not a custom tool.
 * @param  tool - The tool.
 * @return `true` when the tool is not a custom tool.
 */
function isNativeTool(tool: Optional<EditorTools>): tool is Tools {
  return tool !== CustomTools.Redact
}

interface Props extends ImageEditorStateProps {
  image: ImageEditorHook['imageEditorImage']
  onLoaded: (dimensions: ImageDimensions) => void
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
    addText: (color: Color) => void
    getImages: () => Optional<CanvasImageSource[]>
    hasAnnotations: () => boolean
  }
}

export interface ImageEditorStateProps {
  imageEditorDispatch: React.Dispatch<ImageEditorAction>
  imageEditorState: ImageEditorState
}

export interface ImageEditorState {
  _self: boolean
  fillColor: Optional<Color>
  lineColor: Color
  lineWidth: LineWidth
  tool: Optional<EditorTools>
}

export interface LineWidth {
  svgIcon: SvgIconName
  value: number
}

export type EditorTools = Tools | CustomTools
