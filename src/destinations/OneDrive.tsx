import React from 'react'

import Destination, {
  AppError,
  DestinationConfiguration,
  DestinationSettings,
  DestinationSettingSetter,
  DestinationSettingsGetter,
  ErrorHandler,
  HistoryEntry,
  ImageDimensions,
  jwtDecode,
  SettingsPanelProps,
  ShareOptions,
  ShareResponse,
} from './DestinationBase'

/**
 * OneDrive redirect URI.
 */
const RedirectUri = 'capture://oauth/onedrive'

/**
 * OneDrive API scopes.
 */
const Scopes = 'offline_access openid profile Files.ReadWrite.AppFolder'

/**
 * OneDrive destination.
 */
class OneDrive extends Destination {
  /**
   * Authorization API.
   */
  private authApi = Destination.addApi('https://login.microsoftonline.com')

  /**
   * Returns the destination configuration.
   * @return The configuration.
   */
  getConfiguration(): DestinationConfiguration {
    return {
      alwaysAvailable: false,
      id: 'onedrive',
      name: 'OneDrive',
    }
  }

  /**
   * Returns the destination default settings.
   * @return The default settings.
   */
  getDefaultSettings(): OneDriveSettings {
    return {}
  }

  /**
   * Checks if the destination is available or not.
   * @param getSettings - OneDrive settings getter.
   */
  isAvailable(getSettings: DestinationSettingsGetter): boolean {
    const settings = getSettings<OneDriveSettings>()
    const isLoggedIn = typeof settings.id !== 'undefined'

    return isLoggedIn
  }

  /**
   * Cleans a filename by removing characters forbidden on OneDrive.
   * @param  filename - The filename to clean.
   * @return The cleaned filename.
   */
  cleanFilename(filename: string): string {
    return filename.replace(/:/g, '-')
  }

  /**
   * Share a file to OneDrive.
   * @param path - The path of the file to share.
   * @param size - The shared image file size.
   * @param dimensions - The shared image dimensions.
   * @param shareOptions - The options related to this specific share.
   * @param getSettings - OneDrive settings getter.
   * @param setSettings - OneDrive settings setter.
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
    const headers = await this.getHeaders(getSettings, setSettings)
    const blob = await this.getFileBlob(path)

    const uploadResponse = await this.api
      .url(`/drive/special/approot:/${this.cleanFilename(filename)}:/content`)
      .content('application/octet-stream')
      .headers(headers)
      .body(blob)
      .put()
      .json<UploadApiResponse>()

    const { id } = uploadResponse

    const shareResponse = await this.api
      .url(`/me/drive/items/${id}/createLink`)
      .headers(headers)
      .post({
        scope: 'anonymous',
        type: 'view',
      })
      .json<ShareApiResponse>()

    const { webUrl } = shareResponse.link

    return this.getShareResponse(path, size, dimensions, {
      anon: false,
      id,
      link: webUrl,
    })
  }

  /**
   * Deletes a file from OneDrive.
   * @param entry - The entry to delete.
   * @param getSettings - OneDrive settings getter.
   * @param setSettings - OneDrive settings setter.
   */
  async delete(
    entry: HistoryEntry,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<void> {
    const filename = this.getFileName(entry.path)
    const headers = await this.getHeaders(getSettings, setSettings)

    return this.api
      .url(`/drive/special/approot:/${this.cleanFilename(filename)}`)
      .headers(headers)
      .delete()
  }

  /**
   * Returns the headers to use while communicating with OneDrive.
   * @param getSettings - OneDrive settings getter.
   * @param setSettings - OneDrive settings setter.
   */
  async getHeaders(
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<Record<string, string>> {
    let settings = getSettings<OneDriveSettings>()

    if (!settings.accessToken || !settings.expiry || !settings.refreshToken) {
      throw new Error('Missing access token, refresh token or expiry to share file on OneDrive.')
    }

    if (this.isTokenExpired(settings.expiry)) {
      const refreshedAccessToken = await this.getRefreshedAccessToken(settings.refreshToken)

      setSettings<OneDriveSettings>('accessToken', refreshedAccessToken.accessToken)
      setSettings<OneDriveSettings>('expiry', refreshedAccessToken.expiry)
      setSettings<OneDriveSettings>('refreshToken', refreshedAccessToken.refreshToken)

      settings = getSettings<OneDriveSettings>()
    }

    return { Authorization: `Bearer ${settings.accessToken}`, 'Content-Type': 'application/json' }
  }

  /**
   * Refreshes an expired access token.
   * @param  refreshToken - The refresh token to use to get a new access token.
   * @return The new access token and expiry.
   */
  async getRefreshedAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiry: string; refreshToken: string }> {
    const response = await this.authApi
      .url('/common/oauth2/v2.0/token')
      .formUrl({
        client_id: process.env.REACT_APP_ONEDRIVE_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: Scopes,
      })
      .post()
      .json<RefreshTokenApiResponse>()

    return {
      accessToken: response.access_token,
      expiry: this.getTokenExpiry(response.expires_in),
      refreshToken: response.refresh_token,
    }
  }

  /**
   * Returns the destination settings panel.
   * @return The settings panel.
   */
  getSettingsPanel(): React.FC<SettingsPanelProps> {
    return ({ getSettings, openUrl, setSettings, Ui }) => {
      const settings = getSettings<OneDriveSettings>()
      const isLoggedIn = typeof settings.id !== 'undefined'

      const logout = async (): Promise<void> => {
        await this.signOut()

        setSettings<OneDriveSettings>('accessToken', undefined)
        setSettings<OneDriveSettings>('expiry', undefined)
        setSettings<OneDriveSettings>('id', undefined)
        setSettings<OneDriveSettings>('refreshToken', undefined)
        setSettings<OneDriveSettings>('username', undefined)
      }

      const authorize = async (): Promise<void> => {
        const authState = await this.generateAuthState()

        const queryParameters = {
          client_id: process.env.REACT_APP_ONEDRIVE_CLIENT_ID,
          code_challenge: authState.challenge,
          code_challenge_method: authState.method,
          redirect_uri: RedirectUri,
          response_mode: 'query',
          response_type: 'code',
          scope: Scopes,
          state: authState.random,
        }
        const request = this.authApi.url('/common/oauth2/v2.0/authorize').query(queryParameters)

        return openUrl(request._url)
      }

      return (
        <>
          <Ui.Group title={isLoggedIn ? `Logged in as ${settings.username}` : 'User Account'}>
            <Ui.LoginRequired destinationName={this.getConfiguration().name} visible={!isLoggedIn} />
            <Ui.Button onClick={isLoggedIn ? logout : authorize}>{isLoggedIn ? 'Logout' : 'Login'}</Ui.Button>
          </Ui.Group>
        </>
      )
    }
  }

  /**
   * Triggered when an OAuth request is received for the OneDrive destination.
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

    const code = queryString['code']
    const state = queryString['state']

    if (state !== this.authState?.random) {
      authError = new Error('States do not match.')
    } else if (!code) {
      authError = new Error('Missing code.')
    }

    if (!authError && code) {
      try {
        const tokenReponse = await this.getAccessToken(code)
        const identity = jwtDecode<IdentityToken>(tokenReponse.id_token)

        setSettings<OneDriveSettings>('accessToken', tokenReponse['access_token'])
        setSettings<OneDriveSettings>('expiry', this.getTokenExpiry(tokenReponse['expires_in']))
        setSettings<OneDriveSettings>('id', identity.oid)
        setSettings<OneDriveSettings>('refreshToken', tokenReponse['refresh_token'])
        setSettings<OneDriveSettings>('username', identity.preferred_username)
      } catch (error) {
        authError = error
      }
    }

    if (authError) {
      handleError(new AppError('Something went wrong while login with OneDrive.', authError, true))
    }

    this.authState = undefined
  }

  /**
   * Gets an access token after the app has been authorized.
   * @param  code - The code returned by OneDrive during the authorization step.
   * @return The login informations including the access token, refresh token and expiry.
   */
  getAccessToken(code: string): Promise<TokenApiResponse> {
    return this.authApi
      .url('/common/oauth2/v2.0/token')
      .formUrl({
        client_id: process.env.REACT_APP_ONEDRIVE_CLIENT_ID,
        code,
        code_verifier: this.authState?.verifier,
        grant_type: 'authorization_code',
        redirect_uri: RedirectUri,
      })
      .post()
      .json<TokenApiResponse>()
  }

  /**
   * Signs the user out.
   */
  signOut(): Promise<void> {
    return this.authApi.url('/common/oauth2/v2.0/logout').query({ post_logout_redirect_uri: RedirectUri }).get()
  }
}

export default new OneDrive('https://graph.microsoft.com/v1.0')

export interface OneDriveSettings extends DestinationSettings {
  accessToken?: string
  expiry?: string
  id?: string
  refreshToken?: string
  username?: string
}

interface TokenApiResponse {
  access_token: string
  expires_in: number
  ext_expires_in: number
  id_token: string
  scope: string
  refresh_token: string
  token_type: 'Bearer'
}

interface IdentityToken {
  ver: string
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  nbf: number
  name: string
  preferred_username: string
  oid: string
  tid: string
  aio: string
}

interface RefreshTokenApiResponse {
  access_token: string
  expires_in: number
  ext_expires_in: number
  id_token?: string
  refresh_token: string
  scope: string
  token_type: 'Bearer'
}

interface UploadApiResponse {
  createdDateTime: string
  cTag: string
  eTag: string
  id: string
  lastModifiedDateTime: string
  name: string
  size: number
  webUrl: string
}

interface ShareApiResponse {
  id: string
  roles: ('read' | 'write' | 'sp.owner' | 'sp.member')[]
  shareId: string
  expirationDateTime: string
  hasPassword: boolean
  link: {
    type: 'view' | 'edit' | 'embed'
    webUrl: string
    application: {
      id: string
    }
  }
}
