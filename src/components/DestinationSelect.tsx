import React from 'react'
import tw, { styled } from 'twin.macro'

import { getDestination, getDestinations } from '../destinations'
import type { DestinationId } from '../destinations/DestinationBase'
import { useSettings } from '../store'
import Select from './Select'

const Wrapper = styled.div`
  & > div {
    min-width: 110px;

    button {
      ${tw`w-full`}
    }
  }
`

function destinationRenderer(destinationId: DestinationId): React.ReactNode {
  return getDestination(destinationId).getConfiguration().name
}

const DestinationSelect: React.FC<Props> = ({ destinationId, onChangeDestination, ...restProps }) => {
  const { getDestinationSettingsGetter } = useSettings()
  const destinationIds: DestinationId[] = Object.keys(getDestinations(true, getDestinationSettingsGetter))

  return (
    <Wrapper>
      <Select
        {...restProps}
        items={destinationIds}
        selectedItem={destinationId}
        onChange={onChangeDestination}
        itemRenderer={destinationRenderer}
      />
    </Wrapper>
  )
}

export default DestinationSelect

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  destinationId: DestinationId
  onChangeDestination: (destinationId: DestinationId) => void
}
