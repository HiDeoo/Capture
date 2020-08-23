import React from 'react'

import { getDestination, getDestinations } from '../destinations'
import type { DestinationId } from '../destinations/DestinationBase'
import { useSettings } from '../store'
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
  const { getDestinationSettingsGetter } = useSettings()
  const destinationIds: DestinationId[] = Object.keys(getDestinations(true, getDestinationSettingsGetter))

  return (
    <Select
      {...restProps}
      items={destinationIds}
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
