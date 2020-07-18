import React from 'react'

import { useHistory, useSettings } from '../store'
import { pluralize } from '../utils/string'
import { Button, Group, P } from './SettingsUi'

/**
 * Configuration of the general settings panel.
 */
export const GeneralSettingConfiguration = {
  id: 'general',
  name: 'General',
} as const

const GeneralSettings: React.FC<{}> = () => {
  const { clearHistory, entries } = useHistory()
  const { debugGeneralOption, setDebugGeneralOption } = useSettings()

  function updateSetting(): void {
    setDebugGeneralOption(`general - ${new Date().toString()}`)
  }

  return (
    <>
      <Group title="History">
        <P>
          Size: {entries.length} {pluralize(entries.length, 'screenshot', 'screenshots')} so far.
        </P>
        <Button onClick={clearHistory} disabled={entries.length === 0}>
          Clear history
        </Button>
      </Group>
      <Group title="Debug">
        <Button onClick={updateSetting}>Update general setting</Button>
        <div>{debugGeneralOption}</div>
      </Group>
    </>
  )
}

export default GeneralSettings
