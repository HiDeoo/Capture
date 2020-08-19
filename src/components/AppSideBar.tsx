import { observer } from 'mobx-react-lite'
import React from 'react'
import { ifProp, theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import { useApp } from '../store'
import { Panel } from '../store/app'
import Icon, { IconSymbol } from './Icon'
import SideBar, { SideBarButton, SideBarComponent, SideBarEntry, SideBarEntryProps } from './SideBar'

/**
 * The ordered application sidebar entries.
 */
const Entries: (AppSideBarEntry | React.ReactNode)[] = [
  { id: 'library', panel: Panel.Library, symbol: IconSymbol.ListDash },
  { id: 'editor', panel: Panel.Editor, symbol: IconSymbol.Pencil },
  <div tw="flex-1" />,
  { id: 'settings', panel: Panel.Settings, symbol: IconSymbol.Gear },
]

const StyledSideBar = styled(SideBar as SideBarComponent<AppSideBarEntry>)<SideBarProps>`
  ${tw`border-solid border-r pt-1`}

  background-color: ${theme('sideBar.background')};
  border-color: ${theme('sideBar.border')};
  color: ${ifProp('isFocused', theme('sideBar.color'), theme('sideBar.blurred.color'))};
  width: ${theme('sideBar.width')};

  & ${SideBarButton} {
    ${tw`rounded-md`}

    color: ${ifProp('isFocused', theme('sideBar.color'), theme('sideBar.blurred.color'))};
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

    &.selected {
      background-color: ${theme('sideBar.selected.background')};
      color: ${theme('sideBar.selected.color')};
      opacity: ${ifProp('isFocused', 1, 0.95)};
    }
  }
`

const AppSideBar: React.FC = () => {
  const { currentPanel, hasPendingScreenshots, isFocused, setCurrentPanel } = useApp()

  function getEntryProps(entry: AppSideBarEntry): SideBarEntryProps {
    return {
      content: <Icon symbol={entry.symbol} />,
      disabled:
        (entry.panel === Panel.Editor && !hasPendingScreenshots) ||
        (entry.panel !== Panel.Editor && hasPendingScreenshots),
      selected: entry.panel === currentPanel,
    }
  }

  function onClickEntry(entry: AppSideBarEntry): void {
    setCurrentPanel(entry.panel)
  }

  return <StyledSideBar entries={Entries} onClick={onClickEntry} getEntryProps={getEntryProps} isFocused={isFocused} />
}

export default observer(AppSideBar)

interface AppSideBarEntry extends SideBarEntry {
  symbol: IconSymbol
  panel: Panel
}

interface SideBarProps {
  isFocused: boolean
}
