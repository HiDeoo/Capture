import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

/**
 * StyledButton component.
 */
const StyledButton = styled.button`
  &:focus {
    ${tw`outline-none`}
  }
`

/**
 * Button Component.
 */
const Button: React.FC<ButtonProps> = (restProps) => {
  return <StyledButton {...restProps} type="button" />
}

export default Button

/**
 * React Props.
 */
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>
