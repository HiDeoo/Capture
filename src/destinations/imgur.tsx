import fs from 'fs'
import React, { useState } from 'react'
import wretch, { Wretcher } from 'wretch'

import type { SettingsPanelProps } from '../components/SettingsPanel'
import type { DestinationToolBarProps } from '../components/ToolBar'
import Destination, { DestinationConfiguration, DestinationSettings } from '../utils/Destination'

enum AccountShareOption {
  Anon = 'Share anonymously',
  User = 'Share as',
}

/**
 * Imgur destination.
 */
class Imgur implements Destination {
  /**
   * Returns the API object used to perform HTTP requests.
   */
  static get Api(): Wretcher {
    return wretch('https://api.imgur.com')
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
  async share(filePath: string, destinationSettings: ImgurSettings): Promise<void> {
    // TODO Refresh token if needed

    // TODO Do something relevant with the response and pass back proper infos to the renderer.
    const response = await Imgur.Api.url('/3/upload')
      .headers({ Authorization: `Client-ID ${process.env.REACT_APP_IMGUR_CLIENT_ID}` })
      .formData({ image: fs.createReadStream(filePath) })
      .post()
      .json()

    console.log('response ', response)

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
        // eslint-disable-next-line @typescript-eslint/camelcase
        const queryParameters = { client_id: process.env.REACT_APP_IMGUR_CLIENT_ID, response_type: 'token' }
        const request = Imgur.Api.url('/oauth2/authorize').query(queryParameters)

        return openUrl(request._url)
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
   * Returns the destination toolbar if any.
   * @return The destination toolbar visible in the editor.
   */
  getToolBar(): React.FC<DestinationToolBarProps> {
    return ({ getSettings, Ui }) => {
      const { username } = getSettings<ImgurSettings>()
      const [accountShareOption, setAccountShareOption] = useState(AccountShareOption.Anon)

      function onChangeAccountShareOption(event: React.ChangeEvent<HTMLSelectElement>): void {
        setAccountShareOption(event.target.value as AccountShareOption)
      }

      // TODO Fix condition
      const AccountPicker = !username ? (
        <Ui.Select
          value={accountShareOption}
          onChange={onChangeAccountShareOption}
          options={[
            AccountShareOption.Anon,
            { label: `${AccountShareOption.User} ${username}`, value: AccountShareOption.User },
          ]}
        />
      ) : null

      return <>{AccountPicker}</>
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
