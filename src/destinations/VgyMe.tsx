import React, { useState } from 'react'

import Form from '../components/Form'
import type { ImageDimensions } from '../components/Img'
import { getIpcRenderer } from '../main/ipc'
import Destination, {
  DestinationConfiguration,
  DestinationSettings,
  DestinationSettingSetter,
  DestinationSettingsGetter,
  HistoryEntry,
  SettingsPanelProps,
  ShareOptions,
  ShareResponse,
} from './DestinationBase'

/**
 * VgyMe destination.
 */
class VgyMe extends Destination {
  /**
   * Returns the destination configuration.
   * @return The configuration.
   */
  getConfiguration(): DestinationConfiguration {
    return {
      alwaysAvailable: false,
      id: 'vgyme',
      name: 'Vgy.me',
    }
  }

  /**
   * Returns the destination default settings.
   * @return The default settings.
   */
  getDefaultSettings(): VgyMeSettings {
    return { userKey: '' }
  }

  /**
   * Returns the destination default share options.
   * @param  settings - The destination settings.
   * @return The default share options.
   */
  getDefaultShareOptions(settings: VgyMeSettings): ShareOptions {
    return {}
  }

  /**
   * Checks if the destination is available or not.
   * @param getSettings - Vgy.me settings getter.
   */
  isAvailable(getSettings: DestinationSettingsGetter): boolean {
    const settings = getSettings<VgyMeSettings>()

    return settings.userKey.length > 0
  }

  /**
   * Share a file to Vgy.me.
   * @param path - The path of the file to share.
   * @param size - The shared image file size.
   * @param dimensions - The shared image dimensions.
   * @param shareOptions - The options related to this specific share.
   * @param getSettings - Vgy.me settings getter.
   * @param setSettings - Vgy.me settings setter.
   */
  async share(
    path: string,
    size: number,
    dimensions: ImageDimensions,
    shareOptions: ShareOptions,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<ShareResponse> {
    const settings = getSettings<VgyMeSettings>()
    const blob = await this.getFileBlob(path)

    const response = await this.api
      .url('/upload')
      .formData({ file: blob, userkey: settings.userKey })
      .post()
      .json<UploadApiResponse>()

    const { delete: deleteLink, filename, image } = response

    return this.getShareResponse(path, size, dimensions, {
      anon: false,
      deleteId: deleteLink,
      id: filename,
      link: image,
    })
  }

  /**
   * Deletes a file from Vgy.me.
   * @param entry - The entry to delete.
   * @param getSettings - Vgy.me settings getter.
   * @param setSettings - Vgy.me settings setter.
   */
  delete(
    entry: HistoryEntry,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<void> {
    if (!entry.deleteId) {
      throw new Error('Missing URL to delete screenshot from Vgy.me.')
    }

    return getIpcRenderer().invoke('openUrl', entry.deleteId)
  }

  /**
   * Returns the destination settings panel.
   * @return The settings panel.
   */
  getSettingsPanel(): React.FC<SettingsPanelProps> {
    return ({ getSettings, openUrl, setSettings, Ui }) => {
      const settings = getSettings<VgyMeSettings>()
      const isLoggedIn = settings.userKey.length > 0

      const [userKey, setUserKey] = useState(settings.userKey)

      function login(): void {
        setSettings<VgyMeSettings>('userKey', userKey)
      }

      function logout(): void {
        setUserKey('')
        setSettings<VgyMeSettings>('userKey', '')
      }

      return (
        <>
          <Ui.Group title={isLoggedIn ? 'Logged in' : 'User Account'}>
            <Ui.LoginRequired destinationName={this.getConfiguration().name} visible={!isLoggedIn} />
            <Form onSubmit={isLoggedIn ? logout : login}>
              <Ui.Input
                value={userKey}
                onChange={setUserKey}
                readOnly={isLoggedIn}
                placeholder="User key…"
                tooltip={isLoggedIn ? 'Logout to change your user key' : undefined}
              />
              <Ui.Input type="submit" value={isLoggedIn ? 'Logout' : 'Login'} />
            </Form>
          </Ui.Group>
        </>
      )
    }
  }
}

export default new VgyMe('https://vgy.me')

export interface VgyMeSettings extends DestinationSettings {
  userKey: string
}

interface UploadApiResponse {
  error: boolean
  size: number
  filename: string
  ext: string
  url: string
  image: string
  delete: string
}
