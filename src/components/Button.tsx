import 'twin.macro'

import React from 'react'

const Button: React.FC<ButtonProps> = (restProps) => {
  return <button tw="focus:outline-none disabled:cursor-not-allowed" {...restProps} type="button" />
}

export default Button

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>
