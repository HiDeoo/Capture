import { observer } from 'mobx-react-lite'
import React from 'react'
import { Tools } from 'react-sketch2'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import type { DestinationId, ShareOptions, ShareOptionSetter } from '../destinations/DestinationBase'
import { useSettings } from '../store'
import ColorSelect, { Color, ColorType } from './ColorSelect'
import DestinationSelect from './DestinationSelect'
import { IconSymbol } from './Icon'
import { ImageEditorStateProps, LineWidth, LineWidths } from './ImageEditor'
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
  destinationId,
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

  function onClickTool(id: Optional<string>): void {
    imageEditorDispatch({ type: 'set_tool', tool: id as Optional<Tools> })
  }

  function onChangeLineWidth(newLineWidth: LineWidth): void {
    imageEditorDispatch({ type: 'set_line_width', width: newLineWidth })
  }

  function onChangeLineColor(newLineColor: Color): void {
    imageEditorDispatch({ type: 'set_line_color', color: newLineColor })
  }

  return (
    <ToolBar top>
      <ToolBarButtonGroup onClick={onClickTool} activeId={imageEditorState.tool} disabled={locked}>
        <ToolBarButton symbol={IconSymbol.PencilTip} id={Tools.Pencil} />
        <ToolBarButton symbol={IconSymbol.Rectangle} id={Tools.Rectangle} />
      </ToolBarButtonGroup>
      <Select
        items={LineWidths}
        onChange={onChangeLineWidth}
        itemRenderer={lineWidthRenderer}
        selectedItem={imageEditorState.lineWidth}
      />
      <ColorSelect
        type={ColorType.Border}
        onChangeColor={onChangeLineColor}
        selectedColor={imageEditorState.lineColor}
      />
      <div css={tw`flex-1`} />
      {DestinationToolBar && (
        <DestinationToolBar
          Ui={{ Select }}
          disabled={locked}
          shareOptions={shareOptions}
          setShareOption={setShareOption}
          getSettings={getDestinationSettingsGetter(destinationId)}
        />
      )}
      <StyledDestinationSelect onChangeDestination={onChangeDestination} disabled={locked} />
    </ToolBar>
  )
}

export default observer(EditorToolBar)

interface Props extends ToolbarLockedProps, ImageEditorStateProps {
  destinationId: DestinationId
  onChangeDestination: (destinationId: DestinationId) => void
  setShareOption: ShareOptionSetter
  shareOptions: ShareOptions
}
