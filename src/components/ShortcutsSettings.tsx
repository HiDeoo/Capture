import { observer } from 'mobx-react-lite'
import React from 'react'
import tw, { styled } from 'twin.macro'

import { useSettings } from '../store'
import { UserShortcut } from '../utils/keyboard'
import { Group } from './SettingsUi'
import Shortcut, { ShortcutProps } from './Shortcut'

/**
 * Configuration of the shortcuts settings panel.
 */
export const ShortcutsSettingConfiguration = {
  id: 'shortcuts',
  name: 'Shortcuts',
} as const

const UserShorcutDescription: Record<UserShortcut, string> = {
  [UserShortcut.CaptureScreenshot]: 'nmaqksd dkjqk s',
}

const Shortcuts = styled.div`
  ${tw`grid gap-2`}

  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
`

const ShortcutsSettings: React.FC = () => {
  return (
    <>
      <Group title="General">
        <Shortcuts>
          <MutableShortcut userShortcut={UserShortcut.CaptureScreenshot} />
          <Shortcut label="Do the thing" shortcut="Backspace" />
          <Shortcut label="Do the thing" shortcut="ArrowDown + 1" />
          <Shortcut label="Do the thing" shortcut="Escape" />
          <Shortcut label="Do the thing" shortcut="Control + Shift + 1" />
          <Shortcut label="Do the thing" shortcut="Meta + 1" />
          <Shortcut label="Do the thing" shortcut="Control + 1" />
          <Shortcut label="Do the thing" shortcut="Delete + 1" />
          <Shortcut label="Do the thing" shortcut="Meta + 1" />
          <Shortcut label="Do the thing" shortcut="Meta + 1" />
          <Shortcut label="Do the thing" shortcut="Meta + 1" />
          <Shortcut label="Do the thing" shortcut="Meta + 1" />
          <Shortcut label="Do the thing" shortcut="Meta + 1" />
          <Shortcut label="Do the thing" shortcut="Space + 1" />
          <Shortcut label="Do the thing" shortcut="Meta + 1" />
          <Shortcut label="Do the thing" shortcut="Meta + 1" />
        </Shortcuts>
      </Group>
    </>
  )
}

const MutableShortcut: React.FC<MutableShortcutProps> = observer((restProps) => {
  const { shortcuts, updateShortcut } = useSettings()

  return (
    <Shortcut
      {...restProps}
      onChange={updateShortcut}
      shortcut={shortcuts[restProps.userShortcut]}
      label={UserShorcutDescription[restProps.userShortcut]}
    />
  )
})

export default ShortcutsSettings

interface MutableShortcutProps extends Omit<ShortcutProps, 'shortcut' | 'label' | 'onChange'> {
  userShortcut: NonNullable<ShortcutProps['userShortcut']>
}
