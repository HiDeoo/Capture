import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

/**
 * StyledButton component.
 */
const StyledButton = styled.button`
  ${tw`bg-red-900`}

  &:focus {
    ${tw`outline-none`}
  }
`

/**
 * Button Component.
 */
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (htmlProps) => {
  return <StyledButton {...htmlProps} type="button" />
}

export default Button
