import 'tippy.js/dist/tippy.css'
import 'tippy.js/dist/svg-arrow.css'
import 'tippy.js/animations/shift-away-subtle.css'

import Tippy from '@tippyjs/react'
import React from 'react'
import { theme } from 'styled-tools'
import { Placement, roundArrow } from 'tippy.js'
import tw, { styled } from 'twin.macro'

const StyledTippy = styled(Tippy)`
  ${tw`text-sm`}

  background: ${theme('tooltip.background')};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.26);
  padding: 1px 2px;

  .tippy-svg-arrow {
    fill: ${theme('tooltip.background')};
  }
`

const Tooltip: React.FC<TooltipProps> = ({ children, content, placement = 'top', trigger = 'mouseenter focus' }) => {
  return (
    <StyledTippy
      delay={[400, 0]}
      ignoreAttributes
      trigger={trigger}
      content={content}
      arrow={roundArrow}
      placement={placement}
      animation="shift-away-subtle"
    >
      {children}
    </StyledTippy>
  )
}

export default Tooltip

export interface TooltipProps {
  children: React.ReactElement
  content: React.ReactNode
  placement?: Placement
  trigger?: string
}
