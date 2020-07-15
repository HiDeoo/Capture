import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import { useSettings } from '../store'
import type { DestinationId, ShareOptions } from '../utils/Destination'
import DestinationSelect from './DestinationSelect'
import Select from './Select'
import ToolBar, { ShareOptionSetter, ToolbarLockedProps } from './ToolBar'

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
