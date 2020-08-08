import { addMonths, formatISO, isAfter, parseISO } from 'date-fns'
import React from 'react'

import type { ImageDimensions } from '../components/Img'
import Destination, {
  DestinationConfiguration,
  DestinationSettings,
  DestinationSettingSetter,
  DestinationSettingsGetter,
  DestinationToolBarProps,
  SettingsPanelProps,
  ShareOptions,
  ShareResponse,
} from './DestinationBase'

enum AccountShareOption {
  Anon = 'Share anonymously',
  User = 'Share as',
}

/**
 * Imgur destination.
 */
class Imgur extends Destination {
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
   * Returns the destination default share options.
   * @param  settings - The destination settings.
   * @return The default share options.
   */
  getDefaultShareOptions(settings: ImgurSettings): ImgurShareOptions {
    return { account: settings.username ? AccountShareOption.User : AccountShareOption.Anon }
  }

  /**
   * Share a file to Imgur.
   * @param path - The path of the file to share.
   * @param  size - The shared image file size.
   * @param dimensions - The shared image dimensions.
   * @param shareOptions - The options related to this specific share.
   * @param getSettings - A destination settings getter.
   * @param setSettings - A destination settings setter.
   */
  async share(
    path: string,
    size: number,
    dimensions: ImageDimensions,
    shareOptions: ImgurShareOptions,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<ShareResponse> {
    let settings = getSettings<ImgurSettings>()
    let headers: Record<string, string>

    if (shareOptions.account === AccountShareOption.User) {
      if (!settings.accessToken || !settings.expiry || !settings.refreshToken) {
        throw new Error('Missing access token, refresh token or expiry to share file.')
      }

      const expiry = parseISO(settings.expiry)

      if (isAfter(new Date(), expiry)) {
        const refreshedAccessToken = await this.getRefreshedAccessToken(settings.refreshToken)

        setSettings<ImgurSettings>('accessToken', refreshedAccessToken.accessToken)
        setSettings<ImgurSettings>('expiry', refreshedAccessToken.expiry)
        setSettings<ImgurSettings>('refreshToken', refreshedAccessToken.refreshToken)

        settings = getSettings<ImgurSettings>()
      }

      headers = { Authorization: `Bearer ${settings.accessToken}` }
    } else {
      headers = { Authorization: `Client-ID ${process.env.REACT_APP_IMGUR_CLIENT_ID}` }
    }

    const blob = await this.getFileBlob(path)

    const response = await this.api
      .url('/3/upload')
      .headers(headers)
      .formData({ image: blob })
      .post()
      .json<UploadApiResponse>()

    const { id, deletehash, link } = response.data
    const request = this.api.url(`/3/image/${deletehash}`)

    return this.getShareResponse(path, size, dimensions, {
      id,
      deleteLink: request._url,
      link,
    })
  }

  /**
   * Refreshes an expired access token.
   * @param  refreshToken - The refresh token to use to get a new access token.
   * @return The new access token, refresh token and expiry.
   */
  async getRefreshedAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiry: string; refreshToken: string }> {
    const response = await this.api
      .url('/oauth2/token')
      .post({
        client_id: process.env.REACT_APP_IMGUR_CLIENT_ID,
        client_secret: process.env.REACT_APP_IMGUR_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      })
      .json<RefreshTokenApiResponse>()

    return {
      accessToken: response.access_token,
      expiry: this.getTokenExpiry(),
      refreshToken: response.refresh_token,
    }
  }

  /**
   * Returns the expiry of an access token in the ISO 8601 format.
   * @return The expiry.
   */
  getTokenExpiry(): string {
    // We are not using the `expires_in` field returned by the API to calculate the expiry as the documentation states
    // that the access token expires after 1 month but returns 315360000 (10 years ^^).
    const expiry = addMonths(new Date(), 1)

    return formatISO(expiry)
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
        setSettings<ImgurSettings>('expiry', undefined)
        setSettings<ImgurSettings>('id', undefined)
        setSettings<ImgurSettings>('refreshToken', undefined)
        setSettings<ImgurSettings>('username', undefined)
      }

      const authorize = (): Promise<void> => {
        const queryParameters = { client_id: process.env.REACT_APP_IMGUR_CLIENT_ID, response_type: 'token' }
        const request = this.api.url('/oauth2/authorize').query(queryParameters)

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
  getToolBar(): React.FC<DestinationToolBarProps<ImgurShareOptions>> {
    return ({ disabled, getSettings, shareOptions, setShareOption, Ui }) => {
      const { username } = getSettings<ImgurSettings>()

      function onChangeAccountShareOption(newAccountShareOption: AccountShareOption): void {
        setShareOption<ImgurShareOptions>('account', newAccountShareOption)
      }

      function accountOptionRenderer(accountShareOption: AccountShareOption): React.ReactNode {
        if (accountShareOption === AccountShareOption.User) {
          return `${AccountShareOption.User} ${username}`
        }

        return accountShareOption
      }
      const AccountPicker = username ? (
        <Ui.Select
          disabled={disabled}
          style={{ minWidth: 200 }}
          itemRenderer={accountOptionRenderer}
          onChange={onChangeAccountShareOption}
          items={[AccountShareOption.Anon, AccountShareOption.User]}
          selectedItem={shareOptions.account ?? AccountShareOption.Anon}
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
      setSettings<ImgurSettings>('expiry', this.getTokenExpiry())
      setSettings<ImgurSettings>('id', hash['account_id'])
      setSettings<ImgurSettings>('refreshToken', hash['refresh_token'])
      setSettings<ImgurSettings>('username', hash['account_username'])
    }
  }
}

export default new Imgur('https://api.imgur.com')

export interface ImgurSettings extends DestinationSettings {
  accessToken?: string
  expiry?: string
  id?: string
  refreshToken?: string
  username?: string
}

export interface ImgurShareOptions extends ShareOptions {
  account?: AccountShareOption
}

interface RefreshTokenApiResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  account_username: string
}

interface UploadApiResponse {
  status: number
  success: boolean
  data: {
    id: string
    deletehash: string
    account_id: string | null
    account_url: string | null
    title: string | null
    description: string | null
    name: string
    type: string
    width: number
    height: number
    size: number
    link: string
    tags: string[]
    datetime: number
  }
}
