import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import DestinationSelect from './DestinationSelect'
import ToolBar, { ToolbarLockedProps } from './ToolBar'
import { DestinationId } from '../utils/Destination'

/**
 * Select component.
 */
const Select = styled(DestinationSelect)`
  ${tw`border border-solid font-semibold`}

  background-color: ${theme('toolbar.button.background')};
  border-color: ${theme('toolbar.button.border')};

  &:hover:not(:disabled) {
    background-color: ${theme('toolbar.button.hover.background')};
    border-color: ${theme('toolbar.button.hover.border')};
    color: ${theme('toolbar.button.hover.color')};

    & + .icon {
      color: ${theme('toolbar.button.hover.color')};
    }
  }

  &:disabled {
    opacity: 0.6;
  }
`

/**
 * EditorToolBar Component.
 */
const EditorToolBar: React.FC<Props> = ({ onChangeDestination, locked }) => {
  return (
    <ToolBar top>
      <div css={tw`flex-1`} />
      <Select onChangeDestination={onChangeDestination} disabled={locked} />
    </ToolBar>
  )
}

export default EditorToolBar

/**
 * React Props.
 */
interface Props extends ToolbarLockedProps {
  onChangeDestination: (destinationId: DestinationId) => void
}
