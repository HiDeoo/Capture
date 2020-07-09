import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import SideBar, { SideBarButton, SideBarComponent, SideBarEntry, SideBarEntryProps } from './SideBar'
import { useApp } from '../store'
import { SettingsPanelId } from '../store/app'

/**
 * StyledSideBar component.
 */
const StyledSideBar = styled(SideBar as SideBarComponent<SettingsSideBarEntry>)`
  ${tw`p-3 border-solid border-r items-start`}

  background-color: ${theme('settings.sideBar.background')};
  border-color: ${theme('settings.sideBar.border')};
  min-width: 150px;

  & ${SideBarButton} {
    ${tw`w-full justify-start rounded-md font-medium mb-1`}

    padding: 5px 10px;

    &.selected,
    &:hover:not(:disabled) {
      background-color: ${theme('settings.sideBar.selected.background')};
      color: ${theme('settings.sideBar.selected.color')};
    }

    &:last-of-type {
      ${tw`mb-0`}
    }
  }
`

/**
 * SettingsSideBar Component.
 */
const SettingsSideBar: React.FC<Props> = ({ entries }) => {
  const { setCurrentSettingsPanel, settingsPanel } = useApp()

  function getEntryProps(entry: SettingsSideBarEntry): SideBarEntryProps {
    return {
      content: entry.name,
      selected: entry.id === settingsPanel,
    }
  }

  function onClickEntry(entry: SettingsSideBarEntry): void {
    setCurrentSettingsPanel(entry.id)
  }

  return <StyledSideBar entries={entries} onClick={onClickEntry} getEntryProps={getEntryProps} />
}

export default observer(SettingsSideBar)

/**
 * React Props.
 */
interface Props {
  entries: (SettingsSideBarEntry | React.ReactNode)[]
}

/**
 * Interface describing an entry for the settings sidebar.
 */
export interface SettingsSideBarEntry extends SideBarEntry {
  name: SettingsPanelId
  panel: React.ReactNode
}
