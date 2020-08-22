import 'twin.macro'

import { observer } from 'mobx-react-lite'
import React from 'react'

import { getDestinations } from '../destinations'
import { getIpcRenderer } from '../main/ipc'
import { useApp, useSettings } from '../store'
import { SettingsPanelId } from '../store/app'
import GeneralSettings, { GeneralSettingsConfiguration } from './GeneralSettings'
import SettingsPanel, { SettingsPanelProps } from './SettingsPanel'
import SettingsSideBar, { SettingsSideBarEntry } from './SettingsSideBar'
import { Button, Checkbox, Group } from './SettingsUi'
import ShortcutsSettings, { ShortcutsSettingConfiguration } from './ShortcutsSettings'

/**
 * The ordered settings sidebar entries.
 */
const SidebarEntries: (SettingsSideBarEntry | React.ReactNode)[] = [
  { ...GeneralSettingsConfiguration, panel: GeneralSettings },
  { ...ShortcutsSettingConfiguration, panel: ShortcutsSettings },
  <div tw="h-6" />,
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

const Settings: React.FC = () => {
  const { currentSettingsPanel } = useApp()
  const { getDestinationSettingsGetter, getDestinationSettingsSetter } = useSettings()

  const CurrentPanel = observer(SettingsPanelMap[currentSettingsPanel])

  /**
   * Opens a URL in the default browser.
   */
  function openUrl(url: string): Promise<void> {
    return getIpcRenderer().invoke('openUrl', url)
  }

  return (
    <div tw="h-full w-full flex">
      <SettingsSideBar entries={SidebarEntries} />
      <SettingsPanel>
        <CurrentPanel
          openUrl={openUrl}
          Ui={{ Button, Checkbox, Group }}
          getSettings={getDestinationSettingsGetter(currentSettingsPanel)}
          setSettings={getDestinationSettingsSetter(currentSettingsPanel)}
        />
      </SettingsPanel>
    </div>
  )
}

export default observer(Settings)
