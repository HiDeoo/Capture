import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import Button, { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'

/**
 * StyledButton component.
 */
const StyledButton = styled(Button)`
  ${tw`font-semibold`}
`

/**
 * TitleBarButton Component.
 */
const TitleBarButton: React.FC<Props> = ({ symbol, ...restProps }) => {
  return (
    <StyledButton {...restProps}>
      <Icon symbol={symbol} />
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
