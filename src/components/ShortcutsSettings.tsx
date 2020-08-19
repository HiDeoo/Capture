import React from 'react'
import tw, { styled } from 'twin.macro'

import { Group } from './SettingsUi'
import Shortcut from './Shortcut'

/**
 * Configuration of the shortcuts settings panel.
 */
export const ShortcutsSettingConfiguration = {
  id: 'shortcuts',
  name: 'Shortcuts',
} as const

const Shortcuts = styled.div`
  ${tw`grid`}

  grid-template-columns: repeat(auto-fill, minmax(390px, 1fr));
`

const ShortcutsSettings: React.FC = () => {
  return (
    <>
      <Group title="General">
        <Shortcuts>
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
        </Shortcuts>
      </Group>
    </>
  )
}

export default ShortcutsSettings
