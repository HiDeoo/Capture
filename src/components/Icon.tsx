import React from 'react'
import styled from 'styled-components/macro'

/**
 * Wrapper component.
 */
const Wrapper = styled.span`
  font-family: 'SF Pro Display';
`

/**
 * Available icon symbols from the SF Symbols 1.1 font.
 */
export enum IconSymbol {
  PaperPlane = '􀈟',
  XMark = '􀆄',
}

/**
 * Icon Component.
 */
const Icon: React.FC<IconProps> = ({ symbol, ...htmlPros }) => {
  return <Wrapper {...htmlPros}>{symbol}</Wrapper>
}

export default Icon

/**
 * React Props.
 */
export interface IconProps {
  symbol: IconSymbol
}
