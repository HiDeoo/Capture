import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import DestinationSelect from './DestinationSelect'
import ToolBar from './ToolBar'
import { DestinationId } from '../utils/Destination'

/**
 * Select component.
 */
const Select = styled(DestinationSelect)`
  ${tw`border border-solid text-sm font-semibold`}

  background-color: ${theme('toolbar.button.background')};
  border-color: ${theme('toolbar.button.border')};

  &:hover {
    background-color: ${theme('toolbar.button.hover.background')};
    border-color: ${theme('toolbar.button.hover.border')};
    color: ${theme('toolbar.button.hover.color')};

    & + .icon {
      color: ${theme('toolbar.button.hover.color')};
    }
  }
`

/**
 * EditorToolBar Component.
 */
const EditorToolBar: React.FC<Props> = ({ onChangeDestination }) => {
  return (
    <ToolBar top>
      <div css={tw`flex-1`} />
      <Select onChangeDestination={onChangeDestination} />
    </ToolBar>
  )
}

export default EditorToolBar

/**
 * React Props.
 */
interface Props {
  onChangeDestination: (destinationId: DestinationId) => void
}
