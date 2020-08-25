import { isAfter, parseISO } from 'date-fns'
import { nanoid } from 'nanoid'
import React from 'react'
import wretch from 'wretch'

import { AppError, ErrorHandler } from '../components/ErrorBoundary'
import type { ImageDimensions } from '../components/Img'
import { getPkce, PkceCode } from '../utils/crypto'
import { splitFilePath } from '../utils/string'
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
  getDefaultShareOptions(settings: DropboxSettings): ShareOptions {
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
   * @param setSettings - A destination settings setter.
   */
  async share(
    path: string,
    size: number,
    dimensions: ImageDimensions,
    shareOptions: ShareOptions,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<ShareResponse> {
    const [, filename] = splitFilePath(path)
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
   * @param setSettings - A destination settings setter.
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
   * @param setSettings - A destination settings setter.
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

    const expiry = parseISO(settings.expiry)

    if (isAfter(new Date(), expiry)) {
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
        const request = this.authWretcher.url('/oauth2/authorize').query(queryParameters)

        return openUrl(request._url)
      }

      function debugLogin(): void {
        setSettings<DropboxSettings>(
          'accessToken',
          'sl.AgaOtVuqO8bsp_K8W8P_fve3Nqh7Um7Kp7bxdz1DTFZQ03S8ni85ka1PaBTFvmAgtb6ZiPDkuvpgjNELEc8Pn1sYZ8fWErExnhaElw0ZOiluBEgwszw9A0PxyqgaSggOW-QrssM'
        )
        setSettings<DropboxSettings>('expiry', '2020-08-24T19:37:00+02:00')
        setSettings<DropboxSettings>('id', 'dbid:AAAUJrALXqRUJImIHtpZo0m217FP961v7Zw')
        setSettings<DropboxSettings>('refreshToken', '3wzCGWTbUqQAAAAAAAAAAakK_3sXUKv1fZewjwGd5ZHqxRX6eXRY5lUHjUq7woB')
      }

      return (
        <>
          <Ui.Group title={isLoggedIn ? 'Logged in' : 'User Account'}>
            <Ui.Button onClick={isLoggedIn ? logout : authorize}>{isLoggedIn ? 'Logout' : 'Login'}</Ui.Button>
            <Ui.Button onClick={debugLogin}>Debug Login</Ui.Button>
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
