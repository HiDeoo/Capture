import React from 'react'

import { getIpcRenderer } from '../main/ipc'
import { useHistory, useSettings } from '../store'
import { pluralize } from '../utils/string'
import { Button, Group, P, Path } from './SettingsUi'

/**
 * Configuration of the general settings panel.
 */
export const GeneralSettingsConfiguration = {
  id: 'general',
  name: 'General',
} as const

const GeneralSettings: React.FC = () => {
  const { clearHistory, entries } = useHistory()
  const { screenshotDirectory, setScreenshotDirectory } = useSettings()

  async function onClickUpdateScreenshotDirectory(): Promise<void> {
    const newScreenshotDirectory = await getIpcRenderer().invoke(
      'chooseDirectory',
      'Choose the directory used to save screenshots.'
    )

    if (newScreenshotDirectory) {
      setScreenshotDirectory(newScreenshotDirectory)
    }
  }

  return (
    <>
      <Group title="Screenshot Directory">
        <Path value={screenshotDirectory} />
        <Button onClick={onClickUpdateScreenshotDirectory}>Change directory</Button>
      </Group>
      <Group title="History">
        <P>
          Size: {entries.allIds.length} {pluralize(entries.allIds.length, 'screenshot', 'screenshots')} so far.
        </P>
        <Button onClick={clearHistory} disabled={entries.allIds.length === 0}>
          Clear history
        </Button>
      </Group>
    </>
  )
}

export default GeneralSettings
