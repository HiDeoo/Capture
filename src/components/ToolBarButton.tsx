import React, { useCallback } from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Button, { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'

export { IconSymbol }

const StyledButton = styled(Button)<StyledButtonProps>`
  ${tw`rounded px-2 py-1 mr-2`}

  ${(props) =>
    props.active &&
    `
    && {
      &,
      &:hover:not(:disabled) {
        background-color: ${theme('bar.button.active.background')(props)};
        border-color: ${theme('bar.button.border')(props)};
        color: ${theme('bar.button.active.color')(props)};
      }

      &:hover:disabled {
        cursor: not-allowed;
      }
    }
  `}
`

const StyledIcon = styled(Icon)`
  font-size: 15px;
`

const Group = styled.div<GroupProps>`
  ${tw`mr-2`}

  ${StyledButton} {
    ${tw`mr-0 rounded-none border-r-0`}

    &:first-child {
      ${tw`rounded-l`}
    }

    &:last-child {
      ${tw`rounded-r border-r`}
    }
  }
`

const ToolBarButton: React.FC<ToolBarButtonProps> = ({ active = false, symbol, ...restProps }) => {
  return (
    <StyledButton {...restProps} active={active}>
      <StyledIcon symbol={symbol} />
    </StyledButton>
  )
}

function isToolBarButton(element: {} | null | undefined): element is React.ReactElement<ToolBarButtonProps> {
  return React.isValidElement<ToolBarButtonProps>(element) && element.type === ToolBarButton
}

export const ToolBarButtonGroup: React.FC<ToolBarButtonGroupProps> = ({
  activeId,
  children,
  disabled = false,
  onClick,
}) => {
  const onClickButton = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { id } = event.currentTarget

      onClick(id === activeId ? undefined : id)
    },
    [activeId, onClick]
  )

  return (
    <Group disabled={disabled}>
      {React.Children.map(children, (child) => {
        if (isToolBarButton(child)) {
          return React.cloneElement(child, { active: child.props.id === activeId, disabled, onClick: onClickButton })
        }

        return null
      })}
    </Group>
  )
}

export default ToolBarButton

interface ToolBarButtonProps extends Omit<ButtonProps, 'children'> {
  active?: boolean
  symbol: IconSymbol
}

interface ToolBarButtonGroupProps {
  activeId?: string
  disabled?: boolean
  onClick: (id: Optional<string>) => void
}

interface StyledButtonProps {
  active: boolean
}

interface GroupProps {
  disabled: boolean
}
