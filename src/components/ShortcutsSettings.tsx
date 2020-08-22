import { observer } from 'mobx-react-lite'
import React from 'react'
import tw, { styled } from 'twin.macro'

import { useSettings } from '../store'
import { ShortcutId } from '../utils/keyboard'
import { Group } from './SettingsUi'
import Shortcut, { ShortcutProps } from './Shortcut'

/**
 * Configuration of the shortcuts settings panel.
 */
export const ShortcutsSettingConfiguration = {
  id: 'shortcuts',
  name: 'Shortcuts',
} as const

const UserShorcutDescription: Record<ShortcutId, string> = {
  [ShortcutId.CaptureScreenshot]: 'New screenshot',
}

const Shortcuts = styled.div`
  ${tw`grid gap-2`}

  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
`

const ShortcutsSettings: React.FC = () => {
  return (
    <>
      <Group title="System">
        <Shortcuts>
          <MutableShortcut shortcutId={ShortcutId.CaptureScreenshot} />
          <Shortcut label="Cancel screenshot" shortcut="Escape" />
        </Shortcuts>
      </Group>
      <Group title="Screenshot Editor">
        <Shortcuts>
          <Shortcut label="Pencil" shortcut="1" />
          <Shortcut label="Arrow" shortcut="2" />
          <Shortcut label="Rectangle" shortcut="3" />
          <Shortcut label="Circle" shortcut="4" />
          <Shortcut label="Line" shortcut="5" />
          <Shortcut label="Delete selection" shortcut="Backspace" />
          <Shortcut label="Undo" shortcut="Meta+Z" />
          <Shortcut label="Redo" shortcut="Meta+Shift+Z" />
        </Shortcuts>
      </Group>
    </>
  )
}

const MutableShortcut: React.FC<MutableShortcutProps> = observer((props) => {
  const { shortcuts, updateShortcut } = useSettings()

  return (
    <Shortcut
      {...props}
      onChange={updateShortcut}
      shortcut={shortcuts[props.shortcutId]}
      label={UserShorcutDescription[props.shortcutId]}
    />
  )
})

export default ShortcutsSettings

interface MutableShortcutProps extends Omit<ShortcutProps, 'shortcut' | 'label' | 'onChange'> {
  shortcutId: NonNullable<ShortcutProps['shortcutId']>
}
