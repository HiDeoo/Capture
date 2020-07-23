import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import type { DestinationId, ShareOptions, ShareOptionSetter } from '../destinations/DestinationBase'
import { useSettings } from '../store'
import DestinationSelect from './DestinationSelect'
import { IconSymbol } from './Icon'
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
  locked,
  onChangeDestination,
  setShareOption,
  shareOptions,
}) => {
  const { getDestinationSettingsGetter } = useSettings()

  const destination = getDestination(destinationId)
  const DestinationToolBar = destination.getToolBar && destination.getToolBar()

  return (
    <ToolBar top>
      <ToolBarButton symbol={IconSymbol.Gear} />
      <ToolBarButton symbol={IconSymbol.Gear} disabled />
      <ToolBarButtonGroup activeId="2">
        <ToolBarButton symbol={IconSymbol.Gear} id="1" />
        <div>test</div>
        <ToolBarButton symbol={IconSymbol.Gear} id="2" />
        <ToolBarButton symbol={IconSymbol.Gear} id="3" />
      </ToolBarButtonGroup>
      <ToolBarButtonGroup activeId="2" disabled>
        <ToolBarButton symbol={IconSymbol.Gear} id="1" />
        <div>test</div>
        <ToolBarButton symbol={IconSymbol.Gear} id="2" />
        <ToolBarButton symbol={IconSymbol.Gear} id="3" />
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

interface Props extends ToolbarLockedProps {
  destinationId: DestinationId
  onChangeDestination: (destinationId: DestinationId) => void
  setShareOption: ShareOptionSetter
  shareOptions: ShareOptions
}
