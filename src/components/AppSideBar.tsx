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
  { id: 'library', panel: Panel.Library, symbol: IconSymbol.ListDash, tooltip: 'Library' },
  { id: 'editor', panel: Panel.Editor, symbol: IconSymbol.Pencil, tooltip: 'Editor' },
  <div tw="flex-1" />,
  { id: 'settings', panel: Panel.Settings, symbol: IconSymbol.Gear, tooltip: 'Settings' },
]

const StyledSideBar = styled(SideBar as SideBarComponent<AppSideBarEntry>)<SideBarProps>`
  ${tw`border-solid border-r pt-1`}

  background-color: ${theme('sideBar.background')};
  border-color: ${theme('sideBar.border')};
  color: ${ifProp('isFocused', theme('sideBar.color'), theme('sideBar.blurred.color'))};
  width: ${theme('sideBar.width')};
  -webkit-app-region: drag;

  & ${SideBarButton} {
    ${tw`rounded-md relative`}

    color: ${ifProp('isFocused', theme('sideBar.color'), theme('sideBar.blurred.color'))};
    font-size: 22px;
    height: 34px;
    width: 34px;
    -webkit-app-region: no-drag;

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

const Counter = styled.div`
  ${tw`absolute rounded-full border-2 border-solid z-50`}

  background-color: ${theme('sideBar.badge.background')};
  color: ${theme('sideBar.badge.color')};
  border-color: ${theme('sideBar.badge.color')};
  font-size: 11px;
  padding: 0 5px;
  right: -10px;
  top: -10px;
  z-index: 9999999;
`

const AppSideBar: React.FC = () => {
  const { currentPanel, hasPendingScreenshots, isFocused, pendingScreenshotCount, setCurrentPanel } = useApp()

  function getEntryProps(entry: AppSideBarEntry): SideBarEntryProps {
    let content = <Icon symbol={entry.symbol} />

    if (entry.panel === Panel.Editor && pendingScreenshotCount > 1) {
      content = (
        <>
          <Icon symbol={entry.symbol} />
          <Counter>{pendingScreenshotCount}</Counter>
        </>
      )
    }

    return {
      content,
      disabled:
        (entry.panel === Panel.Editor && !hasPendingScreenshots) ||
        (entry.panel !== Panel.Editor && hasPendingScreenshots),
      selected: entry.panel === currentPanel,
      tooltip: entry.tooltip,
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
  tooltip: string
}

interface SideBarProps {
  isFocused: boolean
}
