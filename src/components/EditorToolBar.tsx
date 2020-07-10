import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { DestinationId } from '../utils/Destination'
import DestinationSelect from './DestinationSelect'
import ToolBar, { ToolbarLockedProps } from './ToolBar'

const Select = styled(DestinationSelect)`
  ${tw`border border-solid font-semibold`}

  background-color: ${theme('bar.button.background')};
  border-color: ${theme('bar.button.border')};

  &:hover:not(:disabled) {
    background-color: ${theme('bar.button.hover.background')};
    border-color: ${theme('bar.button.hover.border')};
    color: ${theme('bar.button.hover.color')};

    & + .icon {
      color: ${theme('bar.button.hover.color')};
    }
  }

  &:disabled {
    opacity: 0.6;
  }
`

const EditorToolBar: React.FC<Props> = ({ onChangeDestination, locked }) => {
  return (
    <ToolBar top>
      <div css={tw`flex-1`} />
      <Select onChangeDestination={onChangeDestination} disabled={locked} />
    </ToolBar>
  )
}

export default EditorToolBar

interface Props extends ToolbarLockedProps {
  onChangeDestination: (destinationId: DestinationId) => void
}
