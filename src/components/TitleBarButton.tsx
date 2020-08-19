import React from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import Button, { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'

export { IconSymbol }

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

const StyledIcon = styled(Icon)`
  font-size: 20px;
`

const TitleBarButton: React.FC<Props> = ({ ref, symbol, ...restProps }) => {
  return (
    <StyledButton {...restProps}>
      <StyledIcon symbol={symbol} />
    </StyledButton>
  )
}

export default TitleBarButton

interface Props extends Omit<ButtonProps, 'children'> {
  symbol: IconSymbol
}
