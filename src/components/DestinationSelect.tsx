import React from 'react'

import { getDestination, getDestinations } from '../destinations'
import type { DestinationId } from '../destinations/DestinationBase'
import Select from './Select'

/**
 * List of destinations IDs to use in a <Select />
 */
const DestinationIds: DestinationId[] = Object.keys(getDestinations())

/**
 * Default destination to select.
 */
// TODO This should be a setting
export const defaultDestinationId = DestinationIds[0]

function destinationRenderer(destinationId: DestinationId): React.ReactNode {
  return getDestination(destinationId).getConfiguration().name
}

const DestinationSelect: React.FC<Props> = ({ onChangeDestination, ...restProps }) => {
  return (
    <Select
      {...restProps}
      items={DestinationIds}
      onChange={onChangeDestination}
      itemRenderer={destinationRenderer}
      selectedItem={defaultDestinationId}
    />
  )
}

export default DestinationSelect

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onChangeDestination: (destinationId: DestinationId) => void
}
