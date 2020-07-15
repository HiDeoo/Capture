import React from 'react'
import styled from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

import type { DestinationSettings, ShareOptions, ShareOptionValue } from '../utils/Destination'
import type Select from './Select'

const Wrapper = styled.div<Props>`
  ${tw`flex items-center px-4 py-2 border-solid text-sm`}

  background-color: ${theme('bar.background')};
  border-color: ${theme('bar.border')};
  border-bottom-width: ${ifProp('top', '1px', '0')};
  border-top-width: ${ifProp('bottom', '1px', '0')};

  & > div {
    ${tw`mr-2`}

    &:last-child {
      ${tw`mr-0`}
    }
  }

  select {
    ${tw`border border-solid font-normal`}

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
  }
`

const ToolBar: React.FC<Props> = ({ bottom = false, children, top = false, ...restProps }) => {
  return (
    <Wrapper {...restProps} bottom={bottom} top={top}>
      {children}
    </Wrapper>
  )
}

export default ToolBar

interface Props {
  bottom?: boolean
  top?: boolean
}

export interface ToolbarLockedProps {
  locked: boolean
}

/**
 * Props available to all destinations toolbars.
 */
export interface DestinationToolBarProps<DestinationShareOptions extends ShareOptions> {
  disabled: boolean
  getSettings: <Settings extends DestinationSettings>() => Settings
  setShareOption: ShareOptionSetter
  shareOptions: DestinationShareOptions
  Ui: {
    Select: typeof Select
  }
}

export type ShareOptionSetter = <DestinationShareOptions extends ShareOptions>(
  key: KnownKeys<DestinationShareOptions>,
  value: ShareOptionValue
) => void
