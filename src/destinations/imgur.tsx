import React from 'react'

import type { SettingsPanelProps } from '../components/SettingsPanel'
import Destination, { DestinationConfiguration, DestinationSettings } from '../utils/Destination'

/**
 * Imgur destination.
 */
class Imgur implements Destination {
  /**
   * Returns a formatted URL to access the Imgur API.
   * @param  path - The path to the API.
   * @param  searchParams - Any search parameters to add to the URL.
   * @return The URL.
   */
  getUrl(path: string, searchParams?: Record<string, string>): string {
    const url = new URL(`https://api.imgur.com/${path}`)

    if (searchParams) {
      Object.entries(searchParams).forEach(([name, value]) => {
        url.searchParams.append(name, value)
      })
    }

    return url.toString()
  }

  /**
   * Returns the destination configuration.
   * @return The configuration.
   */
  getConfiguration(): DestinationConfiguration {
    return {
      id: 'imgur',
      name: 'Imgur',
    }
  }

  /**
   * Returns the destination default settings.
   * @return The default settings.
   */
  getDefaultSettings(): ImgurSettings {
    return {}
  }

  /**
   * Share a file to Imgur.
   * @param filePath - The path of the file to share.
   */
  async share(filePath: string): Promise<void> {
    console.log('filePath ', filePath)

    // TODO Add implementation

    return Promise.resolve()
  }

  /**
   * Returns the destination settings panel.
   * @return The settings panel.
   */
  getSettingsPanel(): React.FC<SettingsPanelProps> {
    return ({ getSettings, openUrl, setSettings, Ui }) => {
      const settings = getSettings<ImgurSettings>()
      const isLoggedIn = settings.username !== undefined

      function logout(): void {
        setSettings<ImgurSettings>('accessToken', undefined)
        setSettings<ImgurSettings>('expiresIn', undefined)
        setSettings<ImgurSettings>('id', undefined)
        setSettings<ImgurSettings>('refreshToken', undefined)
        setSettings<ImgurSettings>('username', undefined)
      }

      const authorize = (): Promise<void> => {
        return openUrl(
          // eslint-disable-next-line @typescript-eslint/camelcase
          this.getUrl('oauth2/authorize', { client_id: process.env.REACT_APP_IMGUR_CLIENT_ID, response_type: 'token' })
        )
      }

      return (
        <>
          <Ui.Group title={isLoggedIn ? `Logged in as ${settings.username}` : 'User Account'}>
            <Ui.Button onClick={isLoggedIn ? logout : authorize}>{isLoggedIn ? 'Logout' : 'Login'}</Ui.Button>
          </Ui.Group>
        </>
      )
    }
  }

  /**
   * Triggered when an OAuth request is received for the Imgur destination.
   */
  onOAuthRequest(
    setSettings: SettingsPanelProps['setSettings'],
    queryString: ParsedQueryString,
    hash: Optional<ParsedQueryString>
  ): void {
    if (hash) {
      setSettings<ImgurSettings>('accessToken', hash['access_token'])
      setSettings<ImgurSettings>('expiresIn', hash['expires_in'])
      setSettings<ImgurSettings>('id', hash['account_id'])
      setSettings<ImgurSettings>('refreshToken', hash['refresh_token'])
      setSettings<ImgurSettings>('username', hash['account_username'])
    }
  }
}

export default new Imgur()

export interface ImgurSettings extends DestinationSettings {
  accessToken?: string
  expiresIn?: string
  id?: string
  refreshToken?: string
  username?: string
}
