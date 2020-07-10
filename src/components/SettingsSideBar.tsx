import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { useApp } from '../store'
import { SettingsPanelId } from '../store/app'
import SideBar, { SideBarButton, SideBarComponent, SideBarEntry, SideBarEntryProps } from './SideBar'

const StyledSideBar = styled(SideBar as SideBarComponent<SettingsSideBarEntry>)`
  ${tw`p-3 border-solid border-r items-start`}

  background-color: ${theme('bar.background')};
  border-color: ${theme('bar.border')};
  min-width: 150px;

  & ${SideBarButton} {
    ${tw`w-full justify-start rounded-md font-medium mb-1`}

    padding: 5px 10px;

    &.selected,
    &:hover:not(:disabled) {
      background-color: ${theme('bar.button.hover.background')};
      color: ${theme('bar.button.hover.color')};
    }

    &:last-of-type {
      ${tw`mb-0`}
    }
  }
`

const SettingsSideBar: React.FC<Props> = ({ entries }) => {
  const { currentSettingsPanel, setCurrentSettingsPanel } = useApp()

  function getEntryProps(entry: SettingsSideBarEntry): SideBarEntryProps {
    return {
      content: entry.name,
      selected: entry.id === currentSettingsPanel,
    }
  }

  function onClickEntry(entry: SettingsSideBarEntry): void {
    setCurrentSettingsPanel(entry.id)
  }

  return <StyledSideBar entries={entries} onClick={onClickEntry} getEntryProps={getEntryProps} />
}

export default observer(SettingsSideBar)

interface Props {
  entries: (SettingsSideBarEntry | React.ReactNode)[]
}

export interface SettingsSideBarEntry extends SideBarEntry {
  name: SettingsPanelId
  panel: React.ReactNode
}
