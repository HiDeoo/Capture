import { observer } from 'mobx-react-lite'
import React from 'react'
import { Tools } from 'react-sketch2'
import tw, { styled } from 'twin.macro'

import { getDestination } from '../destinations'
import type { DestinationId, ShareOptions, ShareOptionSetter } from '../destinations/DestinationBase'
import { useSettings } from '../store'
import ColorSelect, { Color, ColorType } from './ColorSelect'
import DestinationSelect from './DestinationSelect'
import { IconSymbol } from './Icon'
import { CustomTools, EditorTools, ImageEditorStateProps, LINE_WIDTHS, LineWidth } from './ImageEditor'
import Select from './Select'
import Svg from './Svg'
import ToolBar, { ToolbarLockedProps } from './ToolBar'
import ToolBarButton, { ToolBarButtonGroup } from './ToolBarButton'

const StyledDestinationSelect = styled(DestinationSelect)`
  && {
    ${tw`font-semibold`}
  }
`

function lineWidthRenderer(item: LineWidth, isOption: boolean): React.ReactNode {
  if (!isOption) {
    return <Svg icon="lineWidth" width={16} />
  }

  return <Svg icon={item.svgIcon} width={22} />
}

const EditorToolBar: React.FC<Props> = ({
  addText,
  destinationId,
  disableAnnotations,
  imageEditorDispatch,
  imageEditorState,
  locked,
  onChangeDestination,
  setShareOption,
  shareOptions,
}) => {
  const { getDestinationSettingsGetter } = useSettings()

  const destination = getDestination(destinationId)
  const DestinationToolBar = destination.getToolBar && destination.getToolBar()

  const isRedacting = imageEditorState.tool === CustomTools.Redact

  function onClickTool(id: Optional<string>): void {
    imageEditorDispatch({ type: 'set_tool', tool: id as Optional<EditorTools> })
  }

  function onChangeLineWidth(newLineWidth: LineWidth): void {
    imageEditorDispatch({ type: 'set_line_width', width: newLineWidth })
  }

  function onChangeLineColor(newLineColor: Optional<Color>): void {
    if (newLineColor) {
      imageEditorDispatch({ type: 'set_line_color', color: newLineColor })
    }
  }

  function onChangeFillColor(newFillColor: Optional<Color>): void {
    imageEditorDispatch({ type: 'set_fill_color', color: newFillColor })
  }

  function onClickAddText(): void {
    imageEditorDispatch({ type: 'set_tool', tool: undefined })
    addText(imageEditorState.lineColor)
  }

  return (
    <ToolBar top>
      <ToolBarButtonGroup
        onClick={onClickTool}
        activeId={imageEditorState.tool}
        disabled={locked || disableAnnotations}
      >
        <ToolBarButton symbol={IconSymbol.Scribble} id={Tools.Pencil} />
        <ToolBarButton symbol={IconSymbol.ArrowUpRight} id={Tools.Arrow} />
        <ToolBarButton symbol={IconSymbol.Rectangle} id={Tools.Rectangle} />
        <ToolBarButton symbol={IconSymbol.Circle} id={Tools.Circle} />
        <ToolBarButton symbol={IconSymbol.Minus} id={Tools.Line} />
        <ToolBarButton symbol={IconSymbol.PencilTip} id={CustomTools.Redact} />
      </ToolBarButtonGroup>
      <ToolBarButton disabled={locked || disableAnnotations} symbol={IconSymbol.TextCursor} onClick={onClickAddText} />
      <Select
        items={LINE_WIDTHS}
        onChange={onChangeLineWidth}
        itemRenderer={lineWidthRenderer}
        selectedItem={imageEditorState.lineWidth}
        disabled={locked || disableAnnotations || isRedacting}
      />
      <ColorSelect
        type={ColorType.Border}
        onChangeColor={onChangeLineColor}
        selectedColor={imageEditorState.lineColor}
        disabled={locked || disableAnnotations || isRedacting}
      />
      <ColorSelect
        allowTransparent
        type={ColorType.Background}
        onChangeColor={onChangeFillColor}
        selectedColor={imageEditorState.fillColor}
        disabled={locked || disableAnnotations || isRedacting}
      />
      <div tw="flex-1" />
      {DestinationToolBar && (
        <DestinationToolBar
          Ui={{ Select }}
          disabled={locked}
          shareOptions={shareOptions}
          setShareOption={setShareOption}
          getSettings={getDestinationSettingsGetter(destinationId)}
        />
      )}
      <StyledDestinationSelect
        disabled={locked}
        destinationId={destinationId}
        onChangeDestination={onChangeDestination}
      />
    </ToolBar>
  )
}

export default observer(EditorToolBar)

interface Props extends ToolbarLockedProps, ImageEditorStateProps {
  addText: (color: Color) => void
  destinationId: DestinationId
  disableAnnotations: boolean
  onChangeDestination: (destinationId: DestinationId) => void
  setShareOption: ShareOptionSetter
  shareOptions: ShareOptions
}
