import React from 'react'
import styled from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

const Wrapper = styled.div<Props>`
  ${tw`flex px-4 py-2 border-solid text-sm`}

  background-color: ${theme('toolbar.background')};
  border-color: ${theme('toolbar.border')};
  border-bottom-width: ${ifProp('top', '1px', '0')};
  border-top-width: ${ifProp('bottom', '1px', '0')};
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
