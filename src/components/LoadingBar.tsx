import styled, { keyframes } from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

const LoadingBarAnimation = keyframes`
  0% {
    margin-left: -15%;
    width: 15%;
  }
  50% {
    margin-left: 32%;
    width: 35%;
  }
  100% {
    margin-left: 100%;
    width: 10%;
  }
`

const LoadingBar = styled.div<Props>`
  ${tw`fixed inset-0`}

  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-name: ${ifProp('enabled', LoadingBarAnimation, 'none')};
  animation-timing-function: linear;
  animation-timing-function: cubic-bezier(0.445, 0.05, 0.55, 0.95);
  background-color: ${ifProp('enabled', theme('color.tint'), 'transparent')};
  height: 4px;
  will-change: margin-left, width;
`

export default LoadingBar

interface Props {
  enabled: boolean
}
