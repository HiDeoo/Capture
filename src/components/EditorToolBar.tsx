import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import { useSettings } from '../store'
import type { DestinationId } from '../utils/Destination'
import DestinationSelect from './DestinationSelect'
import Select from './Select'
import ToolBar, { ToolbarLockedProps } from './ToolBar'

const StyledDestinationSelect = styled(DestinationSelect)`
  && {
    ${tw`font-semibold`}
  }
`

const EditorToolBar: React.FC<Props> = ({ destinationId, locked, onChangeDestination }) => {
  const { getDestinationSettingsGetter } = useSettings()

  const destination = getDestination(destinationId)
  const ShareOptions = destination.getToolBar && destination.getToolBar()

  return (
    <ToolBar top>
      <div css={tw`flex-1`} />
      {ShareOptions && <ShareOptions getSettings={getDestinationSettingsGetter(destinationId)} Ui={{ Select }} />}
      <StyledDestinationSelect onChangeDestination={onChangeDestination} disabled={locked} />
    </ToolBar>
  )
}

export default observer(EditorToolBar)

interface Props extends ToolbarLockedProps {
  destinationId: DestinationId
  onChangeDestination: (destinationId: DestinationId) => void
}
