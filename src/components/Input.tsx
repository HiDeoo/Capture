import 'twin.macro'

import React, { forwardRef } from 'react'

import { Wrap } from '../utils/react'
import Tooltip from './Tooltip'

export default forwardRef<HTMLInputElement, Props>(({ onChange, tooltip, type = 'text', ...restProps }, ref) => {
  const hasTooltip = typeof tooltip !== 'undefined'

  function onChangeInput(event: React.ChangeEvent<HTMLInputElement>): void {
    if (onChange) {
      onChange(event.target.value)
    }
  }

  function wrapWithTooltip(children: React.ReactElement): React.ReactElement {
    return <Tooltip content={tooltip}>{children}</Tooltip>
  }

  return (
    <Wrap condition={hasTooltip} wrapper={wrapWithTooltip}>
      <input
        ref={ref}
        type={type}
        {...restProps}
        onChange={onChangeInput}
        tw="focus:outline-none focus:shadow-outline disabled:cursor-not-allowed"
      />
    </Wrap>
  )
})

interface Props
  extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'onChange'> {
  tooltip?: string
  onChange?: (text: string) => void
}
