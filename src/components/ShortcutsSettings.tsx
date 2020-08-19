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
          <Shortcut readOnly name="Do the thing" shortcut="AltLeft + 1" />
          <Shortcut name="Do the thing" shortcut="Bacskpace" />
          <Shortcut readOnly name="Do the thing" shortcut="ArrowDown + 1" />
          <Shortcut name="Do the thing" shortcut="Escape" />
          <Shortcut readOnly name="Do the thing" shortcut="ControlLeft + ShiftLeft + 1" />
          <Shortcut name="Do the thing" shortcut="MetaLeft + 1" />
          <Shortcut readOnly name="Do the thing" shortcut="ControlRight + 1" />
          <Shortcut name="Do the thing" shortcut="Delete + 1" />
          <Shortcut readOnly name="Do the thing" shortcut="MetaLeft + 1" />
          <Shortcut name="Do the thing" shortcut="MetaLeft + 1" />
          <Shortcut readOnly name="Do the thing" shortcut="MetaLeft + 1" />
          <Shortcut name="Do the thing" shortcut="MetaLeft + 1" />
          <Shortcut readOnly name="Do the thing" shortcut="MetaLeft + 1" />
          <Shortcut name="Do the thing" shortcut="Space + 1" />
          <Shortcut readOnly name="Do the thing" shortcut="MetaLeft + 1" />
          <Shortcut name="Do the thing" shortcut="MetaLeft + 1" />
        </Shortcuts>
      </Group>
    </>
  )
}

export default ShortcutsSettings
