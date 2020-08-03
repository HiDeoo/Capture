import React from 'react'
import styled from 'styled-components/macro'

const Wrapper = styled.span.attrs({ className: 'icon' })`
  font-family: 'SF Pro Display';
`

/**
 * Available icon symbols from the SF Symbols 1.1 font.
 */
export enum IconSymbol {
  CameraViewFinder = '􀎼',
  Checkmark = '􀆅',
  ChevronDown = '􀆈',
  Gear = '􀍟',
  ListDash = '􀋱',
  PaperPlane = '􀈟',
  Pencil = '􀈊',
  PencilTip = '􀒋',
  Rectangle = '􀏃',
  XMark = '􀆄',
}

const Icon: React.FC<IconProps> = ({ symbol, ...htmlPros }) => {
  return <Wrapper {...htmlPros}>{symbol}</Wrapper>
}

export default Icon

export interface IconProps {
  symbol: IconSymbol
}
