import React from 'react'
import wretch from 'wretch'

import Destination, {
  AppError,
  DestinationConfiguration,
  DestinationSettings,
  DestinationSettingSetter,
  DestinationSettingsGetter,
  ErrorHandler,
  HistoryEntry,
  ImageDimensions,
  SettingsPanelProps,
  ShareOptions,
  ShareResponse,
} from './DestinationBase'

/**
 * Dropbox redirect URI.
 */
const RedirectUri = 'capture://oauth/dropbox'

/**
 * Dropbox destination.
 */
class Dropbox extends Destination {
  /**
   * Authorization wretcher.
   */
  private authWretcher = wretch('https://www.dropbox.com')

  /**
   * Content wretcher.
   */
  private contentWretcher = wretch('https://content.dropboxapi.com')

  /**
   * Returns the destination configuration.
   * @return The configuration.
   */
  getConfiguration(): DestinationConfiguration {
    return {
      alwaysAvailable: false,
      id: 'dropbox',
      name: 'Dropbox',
    }
  }

  /**
   * Returns the destination default settings.
   * @return The default settings.
   */
  getDefaultSettings(): DropboxSettings {
    return {}
  }

  /**
   * Checks if the destination is available or not.
   * @param getSettings - Dropbox settings getter.
   */
  isAvailable(getSettings: DestinationSettingsGetter): boolean {
    const settings = getSettings<DropboxSettings>()
    const isLoggedIn = typeof settings.id !== 'undefined'

    return isLoggedIn
  }

  /**
   * Share a file to Dropbox.
   * @param path - The path of the file to share.
   * @param size - The shared image file size.
   * @param dimensions - The shared image dimensions.
   * @param shareOptions - The options related to this specific share.
   * @param getSettings - Dropbox settings getter.
   * @param setSettings - Dropbox settings setter.
   */
  async share(
    path: string,
    size: number,
    dimensions: ImageDimensions,
    shareOptions: ShareOptions,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<ShareResponse> {
    const filename = this.getFileName(path)
    let headers = await this.getHeaders(getSettings, setSettings, {
      autorename: true,
      mode: 'add',
      mute: true,
      path: `/${filename}`,
    })
    const blob = await this.getFileBlob(path)

    const uploadResponse = await this.contentWretcher
      .url('/2/files/upload')
      .content('application/octet-stream')
      .headers(headers)
      .body(blob)
      .post()
      .json<UploadApiResponse>()

    headers = await this.getHeaders(getSettings, setSettings)

    const shareResponse = await this.api
      .url('/2/sharing/create_shared_link_with_settings')
      .headers(headers)
      .post({
        path: uploadResponse.path_lower,
        settings: { requested_visibility: 'public' },
      })
      .json<ShareApiResponse>()

    const { id, url } = shareResponse

    return this.getShareResponse(path, size, dimensions, {
      anon: false,
      deleteId: uploadResponse.path_lower,
      id,
      link: url,
    })
  }

  /**
   * Deletes a file from Dropbox.
   * @param entry - The entry to delete.
   * @param getSettings - Dropbox settings getter.
   * @param setSettings - Dropbox settings setter.
   */
  async delete(
    entry: HistoryEntry,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<void> {
    const headers = await this.getHeaders(getSettings, setSettings)

    return this.api
      .url('/2/files/delete_v2')
      .headers(headers)
      .post({
        path: entry.deleteId,
      })
      .json()
  }

  /**
   * Returns the headers to use while communicating with Dropbox.
   * @param getSettings - Dropbox settings getter.
   * @param setSettings - Dropbox settings setter.
   * @param apiArgs - API arguments to append to the `Dropbox-API-Arg` header for queries accepting file content in the
   * request body.
   */
  async getHeaders(
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter,
    apiArgs?: Record<string, string | boolean>
  ): Promise<Record<string, string>> {
    let settings = getSettings<DropboxSettings>()

    if (!settings.accessToken || !settings.expiry || !settings.refreshToken) {
      throw new Error('Missing access token, refresh token or expiry to share file on Dropbox.')
    }

    if (this.isTokenExpired(settings.expiry)) {
      const refreshedAccessToken = await this.getRefreshedAccessToken(settings.refreshToken)

      setSettings<DropboxSettings>('accessToken', refreshedAccessToken.accessToken)
      setSettings<DropboxSettings>('expiry', refreshedAccessToken.expiry)

      settings = getSettings<DropboxSettings>()
    }

    const headers: Record<string, string> = { Authorization: `Bearer ${settings.accessToken}` }

    if (apiArgs) {
      headers['Dropbox-API-Arg'] = JSON.stringify(apiArgs)
    }

    return headers
  }

  /**
   * Refreshes an expired access token.
   * @param  refreshToken - The refresh token to use to get a new access token.
   * @return The new access token and expiry.
   */
  async getRefreshedAccessToken(refreshToken: string): Promise<{ accessToken: string; expiry: string }> {
    const response = await this.api
      .url('/oauth2/token')
      .formUrl({
        client_id: process.env.REACT_APP_DROPBOX_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      })
      .post()
      .json<RefreshTokenApiResponse>()

    return {
      accessToken: response.access_token,
      expiry: this.getTokenExpiry(response.expires_in),
    }
  }

  /**
   * Returns the destination settings panel.
   * @return The settings panel.
   */
  getSettingsPanel(): React.FC<SettingsPanelProps> {
    return ({ getSettings, openUrl, setSettings, Ui }) => {
      const settings = getSettings<DropboxSettings>()
      const isLoggedIn = typeof settings.id !== 'undefined'

      function logout(): void {
        setSettings<DropboxSettings>('accessToken', undefined)
        setSettings<DropboxSettings>('expiry', undefined)
        setSettings<DropboxSettings>('id', undefined)
        setSettings<DropboxSettings>('refreshToken', undefined)
      }

      const authorize = async (): Promise<void> => {
        const authState = await this.generateAuthState()

        const queryParameters = {
          client_id: process.env.REACT_APP_DROPBOX_CLIENT_ID,
          code_challenge: authState.challenge,
          code_challenge_method: authState.method,
          force_reapprove: false,
          redirect_uri: RedirectUri,
          response_type: 'code',
          state: authState.random,
          token_access_type: 'offline',
        }
        const request = this.authWretcher.url('/oauth2/authorize').query(queryParameters)

        return openUrl(request._url)
      }

      function onClickOpenFolder(): Promise<void> {
        return openUrl('https://www.dropbox.com/home/Apps/Capture%20Screenshots')
      }

      return (
        <>
          <Ui.Group title={isLoggedIn ? `Logged in as ${settings.username}` : 'User Account'}>
            <Ui.LoginRequired destinationName={this.getConfiguration().name} visible={!isLoggedIn} />
            <Ui.Button onClick={isLoggedIn ? logout : authorize}>{isLoggedIn ? 'Logout' : 'Login'}</Ui.Button>
            {isLoggedIn && <Ui.Button onClick={onClickOpenFolder}>Open folder</Ui.Button>}
          </Ui.Group>
        </>
      )
    }
  }

  /**
   * Triggered when an OAuth request is received for the Dropbox destination.
   */
  async onOAuthRequest(
    setSettings: SettingsPanelProps['setSettings'],
    queryString: ParsedQueryString,
    hash: Optional<ParsedQueryString>,
    handleError: ErrorHandler
  ): Promise<void> {
    let authError: Optional<Error>

    if (!this.authState) {
      authError = new Error('No auth state available.')
    }

    const errorCode = queryString['error']
    const errorDescription = queryString['error_description']
    const state = queryString['state']
    const code = queryString['code']

    if (errorCode || errorDescription) {
      authError = new Error(`Dropbox error: ${errorCode} - ${errorDescription}`)
    } else if (state !== this.authState?.random) {
      authError = new Error('States do not match.')
    } else if (!code || code.length === 0) {
      authError = new Error('Missing code.')
    }

    if (!authError && code) {
      try {
        const tokenReponse = await this.getAccessToken(code)
        const accountResponse = await this.getCurrentAccount(tokenReponse['access_token'])

        setSettings<DropboxSettings>('accessToken', tokenReponse['access_token'])
        setSettings<DropboxSettings>('expiry', this.getTokenExpiry(tokenReponse['expires_in']))
        setSettings<DropboxSettings>('id', tokenReponse['account_id'])
        setSettings<DropboxSettings>('refreshToken', tokenReponse['refresh_token'])
        setSettings<DropboxSettings>('username', accountResponse.name.display_name)
      } catch (error) {
        authError = error
      }
    }

    if (authError) {
      handleError(new AppError('Something went wrong while login with Dropbox.', authError, true))
    }

    this.authState = undefined
  }

  /**
   * Gets an access token after the app has been authorized.
   * @param  code - The code returned by Dropbox during the authorization step.
   * @return The login informations including the access token, refresh token and expiry.
   */
  getAccessToken(code: string): Promise<TokenApiResponse> {
    return this.api
      .url('/oauth2/token')
      .formUrl({
        client_id: process.env.REACT_APP_DROPBOX_CLIENT_ID,
        code,
        code_verifier: this.authState?.verifier,
        grant_type: 'authorization_code',
        redirect_uri: RedirectUri,
      })
      .post()
      .json<TokenApiResponse>()
  }

  /**
   * Gets informations about the current user's account.
   * @param  accessToken - The access token of the user.
   * @return The informations about the current user.
   */
  getCurrentAccount(accessToken: string): Promise<CurrentAccountApiResponse> {
    return this.api
      .url('/2/users/get_current_account')
      .headers({ Authorization: `Bearer ${accessToken}` })
      .post()
      .json<CurrentAccountApiResponse>()
  }
}

export default new Dropbox('https://api.dropboxapi.com')

export interface DropboxSettings extends DestinationSettings {
  accessToken?: string
  expiry?: string
  id?: string
  refreshToken?: string
  username?: string
}

interface TokenApiResponse {
  access_token: string
  account_id: string
  expires_in: number
  refresh_token: string
  scope: string
  token_type: 'bearer'
  uid: string
}

interface RefreshTokenApiResponse {
  access_token: string
  expires_in: number
  token_type: 'bearer'
}

interface UploadApiResponse {
  client_modified: string
  content_hash: string
  id: string
  is_downloadable: boolean
  name: string
  path_display: string
  path_lower: string
  rev: string
  server_modified: string
  size: number
}

interface ShareApiResponse {
  '.tag': string
  client_modified: string
  id: string
  name: string
  path_lower: string
  preview_type: string
  rev: string
  server_modified: string
  size: number
  url: string
}

interface CurrentAccountApiResponse {
  account_id: string
  name: {
    given_name: string
    surname: string
    familiar_name: string
    display_name: string
    abbreviated_name: string
  }
  email: string
  email_verified: boolean
  profile_photo_url: string
  disabled: boolean
  country: string
  locale: string
  referral_link: string
  is_paired: boolean
}
