import 'twin.macro'

import React from 'react'

import type { DestinationSettingSetter, DestinationSettingsGetter } from '../destinations/DestinationBase'
import { Button, Group } from './SettingsUi'

const SettingsPanel: React.FC = ({ children }) => {
  return <div tw="flex-1 overflow-y-auto p-3 overflow-x-hidden text-sm break-words">{children}</div>
}

export default SettingsPanel

/**
 * Props available to all settings panel.
 */
export interface SettingsPanelProps {
  getSettings: DestinationSettingsGetter
  openUrl(url: string): Promise<void>
  setSettings: DestinationSettingSetter
  Ui: {
    Button: typeof Button
    Group: typeof Group
  }
}
