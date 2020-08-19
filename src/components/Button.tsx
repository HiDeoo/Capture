import React from 'react'
import tw, { styled } from 'twin.macro'

const StyledButton = styled.button`
  &:focus {
    ${tw`outline-none`}
  }

  &:disabled {
    ${tw`cursor-not-allowed`}
  }
`

const Button: React.FC<ButtonProps> = (restProps) => {
  return <StyledButton {...restProps} type="button" />
}

export default Button

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>
