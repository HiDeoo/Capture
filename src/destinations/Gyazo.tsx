import React from 'react'

import Destination, {
  AppError,
  DestinationConfiguration,
  DestinationSettings,
  DestinationSettingsGetter,
  ErrorHandler,
  HistoryEntry,
  ImageDimensions,
  SettingsPanelProps,
  ShareOptions,
  ShareResponse,
} from './DestinationBase'

/**
 * Gyazo redirect URI.
 */
const RedirectUri = 'capture://oauth/gyazo'

/**
 * Gyazo destination.
 */
class Gyazo extends Destination {
  /**
   * Upload API.
   */
  private uploadApi = Destination.addApi('https://upload.gyazo.com')

  /**
   * Returns the destination configuration.
   * @return The configuration.
   */
  getConfiguration(): DestinationConfiguration {
    return {
      alwaysAvailable: false,
      id: 'gyazo',
      name: 'Gyazo',
    }
  }

  /**
   * Returns the destination default settings.
   * @return The default settings.
   */
  getDefaultSettings(): GyazoSettings {
    return {}
  }

  /**
   * Checks if the destination is available or not.
   * @param getSettings - Gyazo settings getter.
   */
  isAvailable(getSettings: DestinationSettingsGetter): boolean {
    const settings = getSettings<GyazoSettings>()
    const isLoggedIn = typeof settings.id !== 'undefined'

    return isLoggedIn
  }

  /**
   * Share a file to Gyazo.
   * @param path - The path of the file to share.
   * @param size - The shared image file size.
   * @param dimensions - The shared image dimensions.
   * @param shareOptions - The options related to this specific share.
   * @param getSettings - Gyazo settings getter.
   */
  async share(
    path: string,
    size: number,
    dimensions: ImageDimensions,
    shareOptions: ShareOptions,
    getSettings: DestinationSettingsGetter
  ): Promise<ShareResponse> {
    const headers = this.getHeaders(getSettings)
    const blob = await this.getFileBlob(path)

    const response = await this.uploadApi
      .url('/api/upload')
      .headers(headers)
      .formData({ imagedata: blob })
      .post()
      .json<UploadApiResponse>()

    const { image_id, url } = response

    return this.getShareResponse(path, size, dimensions, {
      anon: false,
      id: image_id,
      link: url,
    })
  }

  /**
   * Deletes a file from Gyazo.
   * @param entry - The entry to delete.
   * @param getSettings - Gyazo settings getter.
   */
  delete(entry: HistoryEntry, getSettings: DestinationSettingsGetter): Promise<void> {
    const headers = this.getHeaders(getSettings)

    return this.api.url(`/api/images/${entry.shareId}`).headers(headers).delete().json()
  }

  /**
   * Returns the headers to use while communicating with Gyazo.
   * @param getSettings - Gyazo settings getter.
   */
  getHeaders(getSettings: DestinationSettingsGetter): Record<string, string> {
    const settings = getSettings<GyazoSettings>()

    if (!settings.accessToken) {
      throw new Error('Missing access token to share file on Gyazo.')
    }

    return { Authorization: `Bearer ${settings.accessToken}` }
  }

  /**
   * Returns the destination settings panel.
   * @return The settings panel.
   */
  getSettingsPanel(): React.FC<SettingsPanelProps> {
    return ({ getSettings, openUrl, setSettings, Ui }) => {
      const settings = getSettings<GyazoSettings>()
      const isLoggedIn = typeof settings.id !== 'undefined'

      function logout(): void {
        setSettings<GyazoSettings>('accessToken', undefined)
        setSettings<GyazoSettings>('id', undefined)
        setSettings<GyazoSettings>('username', undefined)
      }

      const authorize = async (): Promise<void> => {
        const authState = await this.generateAuthState()

        const queryParameters = {
          client_id: process.env.REACT_APP_GYAZO_CLIENT_ID,
          redirect_uri: RedirectUri,
          response_type: 'code',
          state: authState.random,
        }
        const request = this.api.url('/oauth/authorize').query(queryParameters)

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
   * Triggered when an OAuth request is received for the Gyazo destination.
   * @param setSettings - A destination settings setter.
   * @param queryString - The request parsed query string.
   * @param hash - The request parsed hash.
   * @param handleError - Error handler.
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

    const state = queryString['state']
    const code = queryString['code']

    if (state !== this.authState?.random) {
      authError = new Error('States do not match.')
    } else if (!code || code.length === 0) {
      authError = new Error('Missing code.')
    }

    if (!authError && code) {
      try {
        const tokenReponse = await this.getAccessToken(code)
        const accountResponse = await this.getCurrentAccount(tokenReponse['access_token'])

        setSettings<GyazoSettings>('accessToken', tokenReponse['access_token'])
        setSettings<GyazoSettings>('id', accountResponse.user.uid)
        setSettings<GyazoSettings>('username', accountResponse.user.name)
      } catch (error) {
        authError = error
      }
    }

    if (authError) {
      handleError(new AppError('Something went wrong while login with Gyazo.', authError, true))
    }

    this.authState = undefined
  }

  /**
   * Gets an access token after the app has been authorized.
   * @param  code - The code returned by Gyazo during the authorization step.
   * @return The login informations including the access token.
   */
  getAccessToken(code: string): Promise<TokenApiResponse> {
    return this.api
      .url('/oauth/token')
      .post({
        client_id: process.env.REACT_APP_GYAZO_CLIENT_ID,
        client_secret: process.env.REACT_APP_GYAZO_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: RedirectUri,
      })
      .json<TokenApiResponse>()
  }

  /**
   * Gets informations about the current user's account.
   * @param  accessToken - The access token of the user.
   * @return The informations about the current user.
   */
  getCurrentAccount(accessToken: string): Promise<CurrentAccountApiResponse> {
    return this.api
      .url('/api/users/me')
      .headers({ Authorization: `Bearer ${accessToken}` })
      .get()
      .json<CurrentAccountApiResponse>()
  }
}

export default new Gyazo('https://api.gyazo.com')

export interface GyazoSettings extends DestinationSettings {
  accessToken?: string
  id?: string
  username?: string
}

interface TokenApiResponse {
  access_token: string
  token_type: 'bearer'
  scope: 'public'
  created_at: number
}

interface CurrentAccountApiResponse {
  user: {
    email: string
    name: string
    uid: string
    profile_image: string
  }
}

interface UploadApiResponse {
  type: string
  thumb_url: string
  created_at: string
  image_id: string
  permalink_url: string
  url: string
}
