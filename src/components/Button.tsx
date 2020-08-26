import 'twin.macro'

import React, { forwardRef } from 'react'

import { Wrap } from '../utils/react'
import Tooltip, { TooltipProps } from './Tooltip'

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ tooltip, tooltipPlacement, ...restProps }, ref) => {
  const hasTooltip = typeof tooltip !== 'undefined'

  function wrapWithTooltip(children: React.ReactElement): React.ReactElement {
    return (
      <Tooltip content={tooltip} placement={tooltipPlacement}>
        {children}
      </Tooltip>
    )
  }

  return (
    <Wrap condition={hasTooltip} wrapper={wrapWithTooltip}>
      <button ref={ref} tw="focus:outline-none disabled:cursor-not-allowed" {...restProps} type="button" />
    </Wrap>
  )
})

export default Button

export interface ButtonProps
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  tooltip?: TooltipProps['content']
  tooltipPlacement?: TooltipProps['placement']
}
