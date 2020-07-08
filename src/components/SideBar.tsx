import React from 'react'
import styled from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Button, { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'
import { useApp } from '../store'
import { Panel } from '../store/app'

/**
 * SideBarSeparator component.
 */
const SideBarSeparator = tw.div`flex-1`

/**
 * The ordered sidebar elements.
 */
const SideBarElements: (SideBarEntry | React.ReactNode)[] = [
  { symbol: IconSymbol.ListDash, name: 'Library', panel: Panel.Library },
  { symbol: IconSymbol.Pencil, name: 'Editor', panel: Panel.Editor },
  <SideBarSeparator />,
  { symbol: IconSymbol.Gear, name: 'Settings', panel: Panel.Settings },
]

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  ${tw`h-full flex flex-col items-center overflow-y-hidden border-solid border-r pt-1`}

  background-color: ${theme('sideBar.background')};
  border-color: ${theme('sideBar.border')};
  color: ${theme('sideBar.color')};
  width: ${theme('sideBar.width')};
`

/**
 * SideBar Component.
 */
const SideBar: React.FC<{}> = () => {
  const { hasPendingScreenshots, panel, setCurrentPanel } = useApp()

  function onClickEntry(entry: SideBarEntry): void {
    setCurrentPanel(entry.panel)
  }

  function isEntryDisabled(entry: SideBarEntry): boolean {
    switch (entry.panel) {
      case Panel.Editor: {
        return !hasPendingScreenshots
      }
      default: {
        return hasPendingScreenshots
      }
    }
  }

  return (
    <Wrapper>
      {SideBarElements.map((element) => {
        if (isSideBarEntry(element)) {
          return (
            <SideBarButton
              entry={element}
              key={element.name}
              onClick={onClickEntry}
              selected={element.panel === panel}
              disabled={isEntryDisabled(element)}
            />
          )
        }

        return element
      })}
    </Wrapper>
  )
}

/**
 * StyledButton component.
 */
const StyledButton = styled(Button)<StyledButtonProps>`
  ${tw`mb-2 flex justify-center items-center rounded-md`}

  background-color: ${ifProp('selected', theme('sideBar.selected.background'), 'transparent')};
  color: ${ifProp('selected', theme('sideBar.selected.color'), theme('sideBar.color'))};
  font-size: 22px;
  height: 34px;
  width: 34px;

  &:hover:not(:disabled) {
    background-color: ${theme('sideBar.selected.background')};
    color: ${theme('sideBar.selected.color')};
  }

  &:disabled {
    opacity: 0.4;
  }
`

/**
 * SideBarButton Component.
 */
const SideBarButton: React.FC<SideBarButtonProps> = ({ entry, onClick, ...restProps }) => {
  function onClickButton(): void {
    onClick(entry)
  }

  return (
    <StyledButton {...restProps} onClick={onClickButton}>
      <Icon symbol={entry.symbol} />
    </StyledButton>
  )
}

/**
 * Checks if a sidebar element is an entry or not.
 * @param  maybeEntry - The element to check.
 * @return `true` when the element is an entry.
 */
function isSideBarEntry(maybeEntry: SideBarEntry | React.ReactNode): maybeEntry is SideBarEntry {
  return (maybeEntry as SideBarEntry).panel !== undefined
}

export default SideBar

/**
 * React Props.
 */
interface SideBarButtonProps extends Omit<ButtonProps, 'onClick'>, StyledButtonProps {
  entry: SideBarEntry
  onClick: (entry: SideBarEntry) => void
}

/**
 * React Props.
 */
interface StyledButtonProps {
  selected: boolean
}

/**
 * Interface describing a sidebar entry.
 */
interface SideBarEntry {
  symbol: IconSymbol
  name: string
  panel: Panel
}
