import { nanoid } from 'nanoid'
import React from 'react'
import wretch from 'wretch'

import { AppError, ErrorHandler } from '../components/ErrorBoundary'
import type { ImageDimensions } from '../components/Img'
import { getPkce, PkceCode } from '../utils/crypto'
import Destination, {
  DeleteOptions,
  DestinationConfiguration,
  DestinationSettings,
  DestinationSettingSetter,
  DestinationSettingsGetter,
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
   * State used when authorizing with Dropbox.
   */
  private authState: Optional<DropboxAuthState>

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
   * Returns the destination default share options.
   * @param  settings - The destination settings.
   * @return The default share options.
   */
  getDefaultShareOptions(settings: DropboxSettings): DropboxShareOptions {
    return {}
  }

  /**
   * Share a file to Dropbox.
   * @param path - The path of the file to share.
   * @param size - The shared image file size.
   * @param dimensions - The shared image dimensions.
   * @param shareOptions - The options related to this specific share.
   * @param getSettings - A destination settings getter.
   * @param setSettings - A destination settings setter.
   */
  share(
    path: string,
    size: number,
    dimensions: ImageDimensions,
    shareOptions: DropboxShareOptions,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<ShareResponse> {
    throw new Error('Not implemented.')
  }

  /**
   * Deletes a file from Dropbox.
   * @param deleteOptions - The options related to this specific deletion.
   * @param getSettings - A destination settings getter.
   * @param setSettings - A destination settings setter.
   */
  delete(
    deleteOptions: DropboxDeleteOptions,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<void> {
    throw new Error('Not implemented.')
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
        const pkce = await getPkce()

        this.authState = { ...pkce, state: nanoid() }

        const queryParameters = {
          client_id: process.env.REACT_APP_DROPBOX_CLIENT_ID,
          code_challenge: pkce.challenge,
          code_challenge_method: pkce.method,
          force_reapprove: false,
          redirect_uri: RedirectUri,
          response_type: 'code',
          state: this.authState.state,
          token_access_type: 'offline',
        }
        const authWretcher = wretch('https://www.dropbox.com')
        const request = authWretcher.url('/oauth2/authorize').query(queryParameters)

        return openUrl(request._url)
      }

      return (
        <>
          <Ui.Group title={isLoggedIn ? 'Logged in' : 'User Account'}>
            <Ui.Button onClick={isLoggedIn ? logout : authorize}>{isLoggedIn ? 'Logout' : 'Login'}</Ui.Button>
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
    } else if (state !== this.authState?.state) {
      authError = new Error('States do not match.')
    } else if (!code || code.length === 0) {
      authError = new Error('Missing code.')
    }

    if (!authError && code) {
      try {
        const response = await this.getAccessToken(code)

        setSettings<DropboxSettings>('accessToken', response['access_token'])
        setSettings<DropboxSettings>('expiry', this.getTokenExpiry(response['expires_in']))
        setSettings<DropboxSettings>('id', response['account_id'])
        setSettings<DropboxSettings>('refreshToken', response['refresh_token'])
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
  async getAccessToken(code: string): Promise<TokenApiResponse> {
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
}

export default new Dropbox('https://api.dropboxapi.com')

export interface DropboxSettings extends DestinationSettings {
  accessToken?: string
  expiry?: string
  id?: string
  refreshToken?: string
}

type DropboxShareOptions = ShareOptions
// export interface DropboxShareOptions extends ShareOptions {}

type DropboxDeleteOptions = DeleteOptions
// export interface DropboxDeleteOptions extends DeleteOptions {}

interface DropboxAuthState extends PkceCode {
  state: string
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
