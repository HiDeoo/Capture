import 'twin.macro'

import React, { forwardRef } from 'react'

const Button = forwardRef<HTMLButtonElement, ButtonProps>((restProps, ref) => {
  return <button ref={ref} tw="focus:outline-none disabled:cursor-not-allowed" {...restProps} type="button" />
})

export default Button

export type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
