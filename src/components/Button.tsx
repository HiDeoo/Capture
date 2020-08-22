import 'twin.macro'

import React, { forwardRef } from 'react'

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <button ref={ref} tw="focus:outline-none disabled:cursor-not-allowed" {...props} type="button" />
})

export default Button

export type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
