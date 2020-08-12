import React from 'react'
import styled from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

const Wrapper = styled.label<WrapperProps>`
  ${tw`block mb-1 flex items-center relative`}

  opacity: ${ifProp('disabled', 0.6, 1)};

  &:last-child {
    ${tw`mb-0`}
  }

  ${(props) =>
    props.disabled &&
    `
    ${Label} {
      cursor: not-allowed;
    }
  `}
`

const Input = tw.input`mr-3 invisible`
const Label = tw.span`cursor-pointer`

const CheckMark = styled.span`
  ${tw`absolute inset-0 rounded-sm cursor-pointer border-solid border`}

  background-color: ${theme('color.black3')};
  border-color: ${theme('color.black2')};
  height: 16px;
  top: 3px;
  width: 16px;

  ${Input}:checked + & {
    background-color: ${theme('color.tint')};
  }

  ${Input}:disabled + & {
    ${tw`cursor-not-allowed`}
  }

  &:after {
    ${tw`hidden absolute`}

    border: solid ${theme('color.white')};
    border-width: 0 2px 2px 0;
    content: '';
    height: 11px;
    left: 4px;
    top: 0;
    transform: rotate(45deg);
    width: 6px;
  }

  ${Input}:checked + &:after {
    ${tw`block`}
  }
`

const Checkbox: React.FC<Props> = ({ checked, disabled = false, label, onChange, ...restProps }) => {
  function onInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    onChange(event.target.checked)
  }

  return (
    <Wrapper disabled={disabled}>
      <Input {...restProps} type="checkbox" checked={checked} onChange={onInputChange} disabled={disabled} />
      <CheckMark />
      <Label>{label}</Label>
    </Wrapper>
  )
}

export default Checkbox

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked: boolean
  disabled?: boolean
  label: string
  onChange: (checked: boolean) => void
}

interface WrapperProps {
  disabled: boolean
}
