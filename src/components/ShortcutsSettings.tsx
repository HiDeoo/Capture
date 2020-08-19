import React from 'react'

import { Group } from './SettingsUi'
import Shortcut from './Shortcut'

/**
 * Configuration of the shortcuts settings panel.
 */
export const ShortcutsSettingConfiguration = {
  id: 'shortcuts',
  name: 'Shortcuts',
} as const

const ShortcutsSettings: React.FC = () => {
  return (
    <>
      <Group title="General">
        <Shortcut readOnly name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut readOnly name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut readOnly name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut readOnly name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut readOnly name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut readOnly name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut readOnly name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut readOnly name="Do the thing" shortcut="Cmd + 1" />
        <Shortcut name="Do the thing" shortcut="Cmd + 1" />
      </Group>
    </>
  )
}

export default ShortcutsSettings
