import { observer } from 'mobx-react-lite'
import React from 'react'
import 'styled-components/macro'
import tw from 'tailwind.macro'

import { getDestinations } from '../destinations'
import GeneralSetting, { GeneralSettingConfiguration } from './GeneralSettings'
import SettingsSideBar, { SettingsSideBarEntry } from './SettingsSideBar'
import { useApp } from '../store'
import { SettingsPanelId } from '../store/app'

/**
 * The ordered settings sidebar entries.
 */
const SidebarEntries: (SettingsSideBarEntry | React.ReactNode)[] = [
  { ...GeneralSettingConfiguration, panel: <GeneralSetting /> },
  <div css={tw`h-6`} />,
  // Add dynamic destinations settings panels.
  ...Object.entries(getDestinations()).reduce<SettingsSideBarEntry[]>((acc, [id, destination]) => {
    if (destination.getSettingsPanel) {
      acc.push({ id, name: destination.getConfiguration().name, panel: destination.getSettingsPanel() })
    }

    return acc
  }, []),
]

/**
 * Settings panel-to-component mapping.
 */
const SettingsPanelMap = SidebarEntries.reduce<Record<SettingsPanelId, React.ReactNode>>((acc, entry) => {
  if (!React.isValidElement(entry)) {
    const currentEntry = entry as SettingsSideBarEntry

    acc[currentEntry.id] = currentEntry.panel
  }

  return acc
}, {})

const Settings: React.FC<{}> = () => {
  const { currentSettingsPanel } = useApp()

  return (
    <div css={tw`h-full w-full flex`}>
      <SettingsSideBar entries={SidebarEntries} />
      <div css={tw`flex-1 overflow-y-auto p-3`}>{SettingsPanelMap[currentSettingsPanel]}</div>
    </div>
  )
}

export default observer(Settings)
