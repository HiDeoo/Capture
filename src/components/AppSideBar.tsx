import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Icon, { IconSymbol } from './Icon'
import SideBar, { SideBarButton, SideBarComponent, SideBarEntry, SideBarEntryProps } from './SideBar'
import { useApp } from '../store'
import { Panel } from '../store/app'

/**
 * The ordered application sidebar entries.
 */
const Entries: (AppSideBarEntry | React.ReactNode)[] = [
  { id: 'library', panel: Panel.Library, symbol: IconSymbol.ListDash },
  { id: 'editor', panel: Panel.Editor, symbol: IconSymbol.Pencil },
  <div css={tw`flex-1`} />,
  { id: 'settings', panel: Panel.Settings, symbol: IconSymbol.Gear },
]

const StyledSideBar = styled(SideBar as SideBarComponent<AppSideBarEntry>)`
  ${tw`border-solid border-r pt-1`}

  background-color: ${theme('sideBar.background')};
  border-color: ${theme('sideBar.border')};
  color: ${theme('sideBar.color')};
  width: ${theme('sideBar.width')};

  & ${SideBarButton} {
    ${tw`rounded-md`}

    color: ${theme('sideBar.color')};
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
    }
  }
`

const AppSideBar: React.FC<{}> = () => {
  const { hasPendingScreenshots, panel, setCurrentPanel } = useApp()

  function getEntryProps(entry: AppSideBarEntry): SideBarEntryProps {
    return {
      content: <Icon symbol={entry.symbol} />,
      disabled:
        (entry.panel === Panel.Editor && !hasPendingScreenshots) ||
        (entry.panel !== Panel.Editor && hasPendingScreenshots),
      selected: entry.panel === panel,
    }
  }

  function onClickEntry(entry: AppSideBarEntry): void {
    setCurrentPanel(entry.panel)
  }

  return <StyledSideBar entries={Entries} onClick={onClickEntry} getEntryProps={getEntryProps} />
}

export default AppSideBar

interface AppSideBarEntry extends SideBarEntry {
  symbol: IconSymbol
  panel: Panel
}
