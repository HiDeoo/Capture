import React from 'react'
import { ifProp, theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

const Wrapper = styled.label<WrapperProps>`
  ${tw`block flex items-center relative last:mb-0`}

  margin-bottom: 0.35rem;
  opacity: ${ifProp('disabled', 0.6, 1)};

  ${(props) =>
    props.disabled &&
    `
    ${Label} {
      cursor: not-allowed;
    }
  `}
`

const Input = styled.input`
  ${tw`mr-3 invisible`}
`

const Label = tw.span`cursor-pointer`

const CheckMark = styled.span`
  ${tw`absolute inset-0 rounded cursor-pointer border-solid border`}

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
    ${tw`hidden absolute transform rotate-45 top-0`}

    border: solid ${theme('color.white')};
    border-width: 0 2px 2px 0;
    content: '';
    height: 11px;
    left: 4px;
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
