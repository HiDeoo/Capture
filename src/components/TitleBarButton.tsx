import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Button, { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'

/**
 * StyledButton component.
 */
const StyledButton = styled(Button)`
  ${tw`font-semibold rounded-md`}

  margin: 0 1px;
  padding: 0 8px;
  -webkit-app-region: no-drag;

  &:hover {
    background-color: ${theme('titleBar.button.background')};
    color: ${theme('titleBar.button.color')};
  }
`

/**
 * StyledIcon component.
 */
const StyledIcon = styled(Icon)`
  font-size: 20px;
`

/**
 * TitleBarButton Component.
 */
const TitleBarButton: React.FC<Props> = ({ symbol, ...restProps }) => {
  return (
    <StyledButton {...restProps}>
      <StyledIcon symbol={symbol} />
    </StyledButton>
  )
}

export default TitleBarButton

/**
 * React Props.
 */
interface Props extends Omit<ButtonProps, 'children'> {
  symbol: IconSymbol
}
