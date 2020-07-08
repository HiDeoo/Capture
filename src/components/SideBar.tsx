import React from 'react'
import styled from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Button, { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'
import { useApp } from '../store'
import { Panel } from '../store/app'

/**
 * The ordered sidebar entries.
 */
const SideBarEntries: SideBarEntry[] = [
  { symbol: IconSymbol.ListDash, name: 'Library', panel: Panel.Library },
  { symbol: IconSymbol.Pencil, name: 'Editor', panel: Panel.Editor },
  { symbol: IconSymbol.Gear, name: 'Settings', panel: Panel.Settings },
]

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  ${tw`h-full flex flex-col items-center overflow-y-hidden border-solid border-r pt-1 select-none`}

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
      {SideBarEntries.map((entry) => (
        <SideBarButton
          entry={entry}
          key={entry.name}
          onClick={onClickEntry}
          selected={entry.panel === panel}
          disabled={isEntryDisabled(entry)}
        />
      ))}
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
