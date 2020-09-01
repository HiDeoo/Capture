import React from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import { getIpcRenderer } from '../main/ipc'
import { useHistory, useSettings } from '../store'
import { pluralize } from '../utils/string'
import DestinationSelect from './DestinationSelect'
import { Button, Checkbox, Group, P, Path } from './SettingsUi'

/**
 * Configuration of the general settings panel.
 */
export const GENERAL_SETTINGS_CONFIGURATION = {
  id: 'general',
  name: 'General',
} as const

const DestinationWrapper = styled(P)`
  ${tw`flex items-center`}

  & > div > div {
    ${tw`ml-3`}

    & > button {
      ${tw`border border-solid px-4 font-semibold`}

      background-color: ${theme('settings.button.background')};
      border-color: ${theme('settings.button.border')};
      min-width: 160px;
      padding-bottom: 7px;
      padding-top: 7px;

      &:hover:not(:disabled) {
        background-color: ${theme('settings.button.hover.background')};
        border-color: ${theme('settings.button.hover.border')};
        color: ${theme('settings.button.hover.color')};
      }
    }

    & > ul {
      background-color: ${theme('settings.button.background')};
      border-color: ${theme('settings.button.border')};

      & li {
        padding-bottom: 7px;
        padding-top: 7px;
      }
    }
  }
`

const GeneralSettings: React.FC = () => {
  const { clearHistory, entries } = useHistory()
  const {
    closeWindowAfterShare,
    copyShareUrlToClipboard,
    defaultDestinationId,
    deleteUnsharedScreenshots,
    openAtLogin,
    playScreenCaptureSounds,
    screenshotDirectory,
    setCloseWindowAfterShare,
    setCopyShareUrlToClipboard,
    setDefaultDestinationId,
    setDeleteUnsharedScreenshots,
    setOpenAtLogin,
    setPlayScreenCaptureSounds,
    setScreenshotDirectory,
  } = useSettings()

  async function onClickUpdateScreenshotDirectory(): Promise<void> {
    const newScreenshotDirectory = await getIpcRenderer().invoke(
      'chooseDirectory',
      'Choose the directory used to save screenshots.'
    )

    if (newScreenshotDirectory) {
      setScreenshotDirectory(newScreenshotDirectory)
    }
  }

  async function onClickResetScreenshotDirectory(): Promise<void> {
    const defaultScreenshotDirectory = await getIpcRenderer().invoke('getDefaultScreenshotDirectory')

    setScreenshotDirectory(defaultScreenshotDirectory)
  }

  async function onChangeOpenAtLogin(open: boolean): Promise<void> {
    setOpenAtLogin(open)

    return getIpcRenderer().invoke('setOpenAtLogin', open)
  }

  return (
    <>
      <Group title="Preferences">
        <Checkbox
          checked={copyShareUrlToClipboard}
          onChange={setCopyShareUrlToClipboard}
          label="Copy URLs of screenshots to the clipboard after sharing a screenshot"
        />
        <Checkbox
          checked={closeWindowAfterShare}
          onChange={setCloseWindowAfterShare}
          label="Close the application window after sharing a screenshot"
        />
        <Checkbox
          checked={playScreenCaptureSounds}
          onChange={setPlayScreenCaptureSounds}
          label="Play a sound when capturing a screenshot"
        />
        <Checkbox
          checked={deleteUnsharedScreenshots}
          onChange={setDeleteUnsharedScreenshots}
          label="Delete unshared screenshots from disk"
        />
        <Checkbox checked={openAtLogin} onChange={onChangeOpenAtLogin} label="Open application at login" />
      </Group>
      <Group title="Destinations">
        <DestinationWrapper>
          Default destination
          <DestinationSelect destinationId={defaultDestinationId} onChangeDestination={setDefaultDestinationId} />
        </DestinationWrapper>
      </Group>
      <Group title="Screenshot Directory">
        <Path value={screenshotDirectory} />
        <Button onClick={onClickUpdateScreenshotDirectory}>Change directory</Button>
        <Button onClick={onClickResetScreenshotDirectory}>Reset directory</Button>
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
