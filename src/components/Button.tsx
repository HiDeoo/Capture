import React from 'react'
import tw from 'tailwind.macro'

/**
 * StyledButton component.
 */
const StyledButton = tw.button`bg-red-900`

/**
 * Button Component.
 */
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (htmlProps) => {
  return <StyledButton {...htmlProps} type="button" />
}

export default Button
