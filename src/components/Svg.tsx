import React from 'react'
import { prop } from 'styled-tools'
import { styled } from 'twin.macro'

const Wrapper = styled.div<StyleProps>`
  svg {
    fill: ${prop('color', 'inherit')};
    height: ${prop('height', 32)}px;
    shape-rendering: crispEdges;
    width: ${prop('width', 32)}px;
  }
`

const Svg: React.FC<Props> = ({ color, height, icon, size, width }) => {
  return (
    <Wrapper color={color} height={height ?? size} width={width ?? size}>
      {SvgIcon[icon]}
    </Wrapper>
  )
}

interface Props extends StyleProps {
  className?: string
  icon: SvgIconName
  size?: number
}

export default Svg

const SvgIcon = {
  diagonal: (
    <svg viewBox="0 0 32 32">
      <path d="M-1.017 30.9L30.59-.709l2.12 2.121L1.105 33.021z" />
      <path d="M30.59 0L32 1.41 1.1 32.31-.31 30.9 30.59 0m0-1.41L-1.73 30.9l2.83 2.83L33.41 1.41l-2.82-2.82z" />
    </svg>
  ),
  lineWidth: (
    <svg viewBox="0 0 32 32" preserveAspectRatio="none">
      <path d="M.5 4.5h31v1H.5z" />
      <path d="M32 4H0v2h32V4zM.5 11.5h31v3H.5z" />
      <path d="M31 12v2H1v-2h30m1-1H0v4h32v-4zM.5 20.5h31v5H.5z" />
      <path d="M31 21v4H1v-4h30m1-1H0v6h32v-6z" />
    </svg>
  ),
  lineWidthXs: (
    <svg viewBox="0 0 32 32" preserveAspectRatio="none">
      <path d="M.5 14.5h31v1H.5z" />
      <path d="M32 14H0v2h32v-2z" />
    </svg>
  ),
  lineWidthSm: (
    <svg viewBox="0 0 32 32" preserveAspectRatio="none">
      <path d="M.5 12.5h31v5H.5z" />
      <path d="M31 13v4H1v-4h30m1-1H0v6h32v-6z" />
    </svg>
  ),
  lineWidthLg: (
    <svg viewBox="0 0 32 32" preserveAspectRatio="none">
      <path d="M.5 10.5h31v9H.5z" />
      <path d="M31 11v8H1v-8h30m1-1H0v10h32V10z" />
    </svg>
  ),
  lineWidthXl: (
    <svg viewBox="0 0 32 32" preserveAspectRatio="none">
      <path d="M.5 8.5h31v13H.5z" />
      <path d="M31 9v12H1V9h30m1-1H0v14h32V8z" />
    </svg>
  ),
  lineWidthXxl: (
    <svg viewBox="0 0 32 32" preserveAspectRatio="none">
      <path d="M.5 6.5h31v17H.5z" />
      <path d="M31 7v16H1V7h30m1-1H0v18h32V6z" />
    </svg>
  ),
} as const

interface StyleProps {
  color?: string
  height?: number
  width?: number
}

export type SvgIconName = keyof typeof SvgIcon
