import React from 'react'

import { getDestinations } from '../destinations'
import Select from './Select'
import { DestinationId } from '../utils/Destination'

/**
 * List of destinations options to use in a <Select />
 */
const destinationOptions = Object.entries(getDestinations()).map(([id, destination]) => {
  return {
    label: destination.getConfiguration().name,
    value: id,
  }
})

/**
 * Default destination to select.
 */
// TODO This should be a setting
export const defaultDestination = destinationOptions[0].value

/**
 * DestinationSelect Component.
 */
const DestinationSelect: React.FC<Props> = ({ onChangeDestination, ...restProps }) => {
  function onChangeSelect(event: React.ChangeEvent<HTMLSelectElement>): void {
    onChangeDestination(event.target.value)
  }

  return <Select {...restProps} options={destinationOptions} onChange={onChangeSelect} />
}

export default DestinationSelect

/**
 * React Props.
 */
interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onChangeDestination: (destinationId: DestinationId) => void
}
