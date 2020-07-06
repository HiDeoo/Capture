import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import Icon, { IconSymbol } from './Icon'

/**
 * StyledSelect component.
 */
const StyledSelect = styled.select`
  ${tw`rounded pl-3 py-2 appearance-none pr-10`}

  &:hover {
    ${tw`cursor-pointer`}
  }

  &:focus {
    ${tw`outline-none`}
  }
`

/**
 * StyledIcon component.
 */
const StyledIcon = styled(Icon)`
  ${tw`absolute top-0 right-0 px-3 pointer-events-none`}

  font-size: 14px;
  padding-top: 10px;
`

/**
 * Select Component.
 */
const Select: React.FC<Props> = ({ options, ...restProps }) => {
  const children = options.map((option) => {
    const optionProps: SelectOption = typeof option === 'object' ? option : { value: option }

    return <option {...optionProps} key={optionProps.value} children={optionProps.label || optionProps.value} />
  })

  return (
    <div css={tw`relative`}>
      <StyledSelect {...restProps}>{children}</StyledSelect>
      <StyledIcon symbol={IconSymbol.ChevronDown} />
    </div>
  )
}

export default Select

/**
 * React Props.
 */
interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  options: (string | SelectOption)[]
}

/**
 * An interface describing a Select option containing a label and a value.
 */
export interface SelectOption {
  label?: string
  value: string
}
