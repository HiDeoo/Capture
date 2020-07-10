import 'styled-components/macro'

import { observer } from 'mobx-react-lite'
import React from 'react'
import tw from 'tailwind.macro'

import { getDestinations } from '../destinations'
import { useApp, useSettings } from '../store'
import { SettingsPanelId } from '../store/app'
import { DestinationSettings, DestinationSettingValue } from '../utils/Destination'
import GeneralSetting, { GeneralSettingConfiguration } from './GeneralSettings'
import SettingsPanel, { SettingsPanelProps } from './SettingsPanel'
import SettingsSideBar, { SettingsSideBarEntry } from './SettingsSideBar'

/**
 * The ordered settings sidebar entries.
 */
const SidebarEntries: (SettingsSideBarEntry | React.ReactNode)[] = [
  { ...GeneralSettingConfiguration, panel: GeneralSetting },
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
const SettingsPanelMap = SidebarEntries.reduce<Record<SettingsPanelId, React.FC<SettingsPanelProps>>>((acc, entry) => {
  if (!React.isValidElement(entry)) {
    const currentEntry = entry as SettingsSideBarEntry

    acc[currentEntry.id] = currentEntry.panel
  }

  return acc
}, {})

const Settings: React.FC<{}> = () => {
  const { currentSettingsPanel } = useApp()
  const { getDestinationSettings, setDestinationSetting } = useSettings()

  const CurrentPanel = observer(SettingsPanelMap[currentSettingsPanel])

  /**
   * Destination-scoped settings getter.
   */
  function getSettings<Settings extends DestinationSettings>(): Settings {
    return getDestinationSettings<Settings>(currentSettingsPanel)
  }

  /**
   * Destination-scoped settings setter.
   */
  function setSettings<Settings extends DestinationSettings>(
    settingId: KnownKeys<Settings>,
    value: DestinationSettingValue
  ): void {
    return setDestinationSetting<Settings>(currentSettingsPanel, settingId, value)
  }

  return (
    <div css={tw`h-full w-full flex`}>
      <SettingsSideBar entries={SidebarEntries} />
      <SettingsPanel>
        <CurrentPanel getSettings={getSettings} setSettings={setSettings} />
      </SettingsPanel>
    </div>
  )
}

export default observer(Settings)
