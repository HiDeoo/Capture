import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Button, { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'

export { IconSymbol }

/**
 * StyledButton component.
 */
const StyledButton = styled(Button)`
  ${tw`font-semibold rounded-md`}

  padding: 1px 8px;
  -webkit-app-region: no-drag;

  &:hover:not(:disabled) {
    background-color: ${theme('titleBar.button.background')};
    color: ${theme('titleBar.button.color')};
  }

  &:disabled {
    opacity: 0.6;
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
