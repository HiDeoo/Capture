import { observer } from 'mobx-react-lite'
import React from 'react'
import { Tools } from 'react-sketch2'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import type { DestinationId, ShareOptions, ShareOptionSetter } from '../destinations/DestinationBase'
import { useSettings } from '../store'
import DestinationSelect from './DestinationSelect'
import { IconSymbol } from './Icon'
import type { ImageEditorStateProps } from './ImageEditor'
import Select from './Select'
import ToolBar, { ToolbarLockedProps } from './ToolBar'
import ToolBarButton, { ToolBarButtonGroup } from './ToolBarButton'

const StyledDestinationSelect = styled(DestinationSelect)`
  && {
    ${tw`font-semibold`}
  }
`

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

  return (
    <ToolBar top>
      <ToolBarButtonGroup onClick={onClickTool} activeId={imageEditorState.tool}>
        <ToolBarButton symbol={IconSymbol.PencilTip} id={Tools.Pencil} />
      </ToolBarButtonGroup>
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
