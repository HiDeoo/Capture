import 'styled-components/macro'

import React from 'react'
import tw from 'tailwind.macro'

import type { DestinationSettings, DestinationSettingValue } from '../utils/Destination'
import type Button from './Button'

const Wrapper = tw.div`flex-1 overflow-y-auto p-3`

const SettingsPanel: React.FC<{}> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>
}

export default SettingsPanel

/**
 * Props available to all settings panel.
 */
export interface SettingsPanelProps {
  getSettings: <Settings extends DestinationSettings>() => Settings
  openUrl(url: string): Promise<void>
  setSettings: <Settings extends DestinationSettings>(
    settingId: KnownKeys<Settings>,
    value: DestinationSettingValue
  ) => void
  Ui: {
    Button: typeof Button
  }
}
