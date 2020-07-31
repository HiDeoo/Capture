import { useSelect, UseSelectStateChange } from 'downshift'
import React from 'react'
import styled from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Icon, { IconSymbol } from './Icon'

const Wrapper = styled.div`
  ${tw`relative`}
`

const Button = styled.button<OpenedProps>`
  ${tw`rounded pl-3 py-1 appearance-none pr-10 relative text-left`}

  border-bottom-left-radius: ${ifProp('opened', 0, '0.25rem')};
  border-bottom-right-radius: ${ifProp('opened', 0, '0.25rem')};

  &:focus {
    ${tw`outline-none`}
  }

  &:disabled {
    ${tw`cursor-not-allowed`}
  }
`

const StyledIcon = styled(Icon)<StyledIconProps>`
  ${tw`absolute top-0 right-0 px-3 pointer-events-none`}

  font-size: 14px;
  opacity: ${ifProp('disabled', 0.6, 1)};
  padding-top: 6px;
  transform: rotate(${ifProp('opened', '180deg', 0)});
  transition-duration: 250ms;
  transform-origin: 50% 57% 0;
  transition-property: transform;
`

const Menu = styled.ul<OpenedProps>`
  ${tw`absolute outline-none border border-solid rounded inset-x-0 overflow-hidden rounded-t-none border-t-0 z-10`}

  background-color: ${theme('bar.button.background')};
  border-color: ${theme('bar.button.border')};
  display: ${ifProp('opened', 'block', 'none')};
`

const Item = styled.li<ItemProps>`
  ${tw`px-3 py-1 cursor-pointer`}

  background-color: ${ifProp('selected', theme('color.tint'), 'transparent')};
`

export function Select<T>({
  disabled = false,
  itemRenderer,
  items,
  itemToString,
  onChange,
  selectedItem,
  style,
  ...restProps
}: Props<T>): JSX.Element {
  const { isOpen, getToggleButtonProps, getMenuProps, highlightedIndex, getItemProps } = useSelect<T>({
    items,
    itemToString: internalItemToString,
    onSelectedItemChange,
    selectedItem,
  })

  function onSelectedItemChange(changes: UseSelectStateChange<T>): void {
    if (changes.selectedItem) {
      onChange(changes.selectedItem)
    }
  }

  function internalItemToString(item: T | null): string {
    if (!item) {
      return ''
    }

    if (!itemToString) {
      return typeof item === 'string' ? item : ''
    }

    return itemToString(item)
  }

  return (
    <Wrapper>
      <Button {...getToggleButtonProps({ disabled })} opened={isOpen} style={style} {...restProps}>
        {itemRenderer ? itemRenderer(selectedItem) : selectedItem}
        <StyledIcon symbol={IconSymbol.ChevronDown} disabled={disabled} opened={isOpen} />
      </Button>
      <Menu {...getMenuProps()} opened={isOpen}>
        {isOpen &&
          items.map((item, index) => (
            <Item
              {...getItemProps({ item, index })}
              selected={highlightedIndex === index}
              key={`${itemToString ? itemToString(item) : item}-${index}`}
            >
              {itemRenderer ? itemRenderer(item) : item}
            </Item>
          ))}
      </Menu>
    </Wrapper>
  )
}

export default Select

interface Props<T> {
  disabled?: boolean
  items: T[]
  itemRenderer?: (item: T) => React.ReactNode
  itemToString?: (item: T) => string
  onChange: (item: T) => void
  selectedItem: T
  style?: React.CSSProperties
}

interface OpenedProps {
  opened: boolean
}

interface ItemProps {
  selected: boolean
}

interface StyledIconProps extends OpenedProps {
  disabled: boolean
}
