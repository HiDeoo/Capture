import { useSelect, UseSelectStateChange } from 'downshift'
import React from 'react'
import { ifProp, theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import { Wrap } from '../utils/react'
import Icon, { IconSymbol } from './Icon'
import Tooltip, { TooltipProps } from './Tooltip'

const Wrapper = tw.div`relative`

const Button = styled.button<OpenedProps>`
  ${tw`rounded pl-3 py-1 appearance-none pr-10 relative text-left focus:outline-none disabled:cursor-not-allowed`}

  border-bottom-left-radius: ${ifProp('opened', 0, '0.25rem')};
  border-bottom-right-radius: ${ifProp('opened', 0, '0.25rem')};
`

const StyledIcon = styled(Icon)<StyledIconProps>`
  ${tw`absolute right-0 px-3 pointer-events-none`}

  font-size: 14px;
  opacity: ${ifProp('disabled', 0.6, 1)};
  top: calc(50% - 9px);
  transform: rotate(${ifProp('opened', '180deg', 0)});
  transition-duration: 250ms;
  transform-origin: 50% 50% 0;
  transition-property: transform;
`

const Menu = styled.ul<OpenedProps>`
  ${tw`absolute outline-none border border-solid rounded inset-x-0 overflow-hidden rounded-t-none border-t-0 z-10`}

  background-color: ${theme('bar.button.background')};
  border-color: ${theme('bar.button.border')};
  display: ${ifProp('opened', 'block', 'none')};
`

const Item = styled.li<ItemProps>`
  ${tw`px-3 py-1 cursor-pointer flex`}

  background-color: ${ifProp('selected', theme('color.tint'), 'transparent')};
`

const Checkmark = styled(Icon)<CheckmarkProps>`
  ${tw`mr-2`}

  visibility: ${ifProp('visible', 'visible', 'hidden')};
`

export function Select<T>({
  disabled = false,
  itemRenderer,
  items,
  itemToString,
  onChange,
  selectedItem,
  style,
  tooltip,
  tooltipPlacement,
  ...restProps
}: Props<T>): JSX.Element {
  const hasTooltip = typeof tooltip !== 'undefined'

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

  function wrapWithTooltip(children: React.ReactElement): React.ReactElement {
    return (
      <Tooltip content={tooltip} placement={tooltipPlacement} trigger="mouseenter">
        {children}
      </Tooltip>
    )
  }

  return (
    <Wrapper>
      <Wrap condition={hasTooltip} wrapper={wrapWithTooltip}>
        <Button {...getToggleButtonProps({ disabled })} opened={isOpen} style={style} {...restProps}>
          {itemRenderer ? itemRenderer(selectedItem, false) : selectedItem}
          <StyledIcon symbol={IconSymbol.ChevronDown} disabled={disabled} opened={isOpen} />
        </Button>
      </Wrap>
      <Menu {...getMenuProps()} opened={isOpen}>
        {isOpen &&
          items.map((item, index) => (
            <Item
              {...getItemProps({ item, index })}
              selected={highlightedIndex === index}
              key={`${itemToString ? itemToString(item) : item}-${index}`}
            >
              <Checkmark symbol={IconSymbol.Checkmark} visible={item === selectedItem} />
              {itemRenderer ? itemRenderer(item, true) : item}
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
  itemRenderer?: (item: T, isOption: boolean) => React.ReactNode
  itemToString?: (item: T) => string
  onChange: (item: T) => void
  selectedItem: T
  style?: React.CSSProperties
  tooltip?: TooltipProps['content']
  tooltipPlacement?: TooltipProps['placement']
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

interface CheckmarkProps {
  visible: boolean
}
