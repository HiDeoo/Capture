import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import type { DestinationSettingSetter, DestinationSettingsGetter } from '../destinations/DestinationBase'
import { Button, Group } from './SettingsUi'

const Wrapper = styled.div`
  ${tw`flex-1 overflow-y-auto p-3 overflow-x-hidden text-sm`}

  overflow-wrap: break-word;
`

const SettingsPanel: React.FC = ({ children }) => {
  return <Wrapper>{children}</Wrapper>
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
