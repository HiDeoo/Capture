import React, { forwardRef } from 'react'
import { styled } from 'twin.macro'

const Wrapper = styled.span.attrs({ className: 'icon' })`
  font-family: 'SF Pro Display';
`

/**
 * Available icon symbols from the SF Symbols 1.1 font.
 */
export enum IconSymbol {
  ArrowRightCircle = '􀁼',
  ArrowUpRight = '􀄯',
  Camera = '􀌞',
  Checkmark = '􀆅',
  ChevronDown = '􀆈',
  ChevronRight = '􀆊',
  Circle = '􀀀',
  Doc = '􀈷',
  ExclamationMarkCircle = '􀁞',
  Folder = '􀈕',
  Gear = '􀍟',
  Link = '􀉣',
  ListDash = '􀋱',
  LockFill = '􀎡',
  Minus = '􀅽',
  MinusCircle = '􀁎',
  Paperclip = '􀉢',
  PaperPlane = '􀈟',
  Pencil = '􀈊',
  Rectangle = '􀏃',
  RectangleAndPaperclip = '􀒖',
  Scribble = '􀓨',
  TextCursor = '􀅫',
  XMark = '􀆄',
}

const Icon: React.FC<IconProps> = forwardRef<HTMLSpanElement, IconProps>(({ symbol, ...restProps }, ref) => {
  return (
    <Wrapper {...restProps} ref={ref}>
      {symbol}
    </Wrapper>
  )
})

export default Icon

export interface IconProps {
  symbol: IconSymbol
}
