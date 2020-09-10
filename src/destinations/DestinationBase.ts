import { addSeconds, formatISO, isAfter, parseISO } from 'date-fns'
import jwtDecode from 'jwt-decode'
import { lookup } from 'mime-types'
import { nanoid } from 'nanoid'
import wretch, { Wretcher } from 'wretch'

import { AppError, DestinationError, ErrorHandler } from '../components/ErrorBoundary'
import type { ImageDimensions } from '../components/Img'
import type { SettingsPanelProps } from '../components/SettingsPanel'
import type { DestinationToolBarProps } from '../components/ToolBar'
import type { HistoryEntry } from '../store/history'
import { getPkce, PkceCode } from '../utils/crypto'
import { splitFilePath } from '../utils/string'

export type { DestinationToolBarProps, ErrorHandler, HistoryEntry, ImageDimensions, SettingsPanelProps }
export { AppError, DestinationError, jwtDecode }

/**
 * Abstract definition of a destination.
 */
export default abstract class Destination {
  /**
   * Returns the destination configuration.
   * @return The configuration.
   */
  abstract getConfiguration(): DestinationConfiguration

  /**
   * Returns the destination default settings.
   * @return The default settings.
   */
  abstract getDefaultSettings(): DestinationSettings

  /**
   * Checks if the destination is available or not.
   * @param getSettings - A destination settings getter.
   */
  isAvailable?(getSettings: DestinationSettingsGetter): boolean

  /**
   * Triggered when an associated OAuth request is received for the destination.
   * @param setSettings - A destination settings setter.
   * @param queryString - The request parsed query string.
   * @param hash - The request parsed hash.
   * @param handleError - Error handler.
   */
  onOAuthRequest?(
    setSettings: DestinationSettingSetter,
    queryString: ParsedQueryString,
    hash: Optional<ParsedQueryString>,
    handleError: ErrorHandler
  ): void

  /**
   * Shares a file to the destination.
   * @param  path - The path of the file to share.
   * @param  size - The shared image file size.
   * @param  dimensions - The shared image dimensions.
   * @param  shareOptions - The options related to this specific share.
   * @param  getSettings - A destination settings getter.
   * @param  setSettings - A destination settings setter.
   * @return An object containing informations regarding the completed share.
   */
  abstract share(
    path: string,
    size: number,
    dimensions: ImageDimensions,
    shareOptions: ShareOptions,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<ShareResponse>

  /**
   * Deletes a file from the destination.
   * @param entry - The entry to delete.
   * @param getSettings - A destination settings getter.
   * @param setSettings - A destination settings setter.
   * @param openUrl - Function to open an URL in the default browser.
   */
  abstract delete(
    entry: HistoryEntry,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter,
    openUrl: (url: string) => Promise<void>
  ): Promise<void>

  /**
   * Returns the destination settings panel if any.
   * @return The settings panel.
   */
  getSettingsPanel?(): React.FC<SettingsPanelProps>

  /**
   * Returns the destination toolbar if any.
   * @return The destination toolbar visible in the editor.
   */
  getToolBar?(): React.FC<DestinationToolBarProps<ShareOptions>>

  /**
   * Adds a new API wretcher.
   * @param  baseUrl - The API base URL.
   * @return The API wretcher.
   */
  static addApi(baseUrl: string): Wretcher {
    return wretch(baseUrl)
  }

  /**
   * Main destination API wretcher.
   */
  private wretcher: Wretcher

  /**
   * Optionally generated authorization state containing a random value and a PKCE code verifier and challenge using
   * SHA-256.
   */
  protected authState?: AuthState

  /**
   * Creates a new instance of the destination.
   * @param baseUrl - The destination main API base URL.
   * @class
   */
  constructor(private readonly baseUrl: string) {
    this.wretcher = Destination.addApi(baseUrl)
  }

  /**
   * Returns the API object used to perform HTTP requests.
   * @return The API object.
   */
  get api(): Wretcher {
    return this.wretcher
  }

  /**
   * Fetches the blob of raw data for a specific file.
   * @param  path - The path of the file.
   * @return The blob.
   */
  async getFileBlob(path: string): Promise<Blob> {
    const response = await fetch(`file://${path}`)
    const blob = await response.blob()
    const type = lookup(path) || ''
    const [, filename] = splitFilePath(path)

    return new File([blob], filename, { type })
  }

  /**
   * Returns the filename associated to a file path.
   * @param  path - The path of the file.
   * @return The filename.
   */
  getFileName(path: string): string {
    const [, filename] = splitFilePath(path)

    return filename
  }

  /**
   * Returns the destination default share options.
   * @param  settings - The destination settings.
   * @return The default share options.
   */
  getDefaultShareOptions(settings: DestinationSettings): ShareOptions {
    return {}
  }

  /**
   * Returns a share response based on informations provided by a destination after a share.
   * @param  path - The path of the shared file.
   * @param  size - The shared image file size.
   * @param  dimensions - The shared image dimensions.
   * @param  destinationShareResponse - The share response from the destination.
   * @return The share response.
   */
  getShareResponse(
    path: string,
    size: number,
    dimensions: ImageDimensions,
    destinationShareResponse: DestinationShareResponse
  ): ShareResponse {
    const { anon, id, deleteId, link } = destinationShareResponse

    return {
      anon,
      date: new Date(),
      deleteId,
      destinationId: this.getConfiguration().id,
      dimensions,
      link,
      path,
      shareId: id,
      size,
    }
  }

  /**
   * Returns the expiry of an access token in the ISO 8601 format.
   * @param  expiresIn - Seconds before the token expires.
   * @return The expiry.
   */
  getTokenExpiry(expiresIn: number): string {
    const expiry = addSeconds(new Date(), expiresIn)

    return formatISO(expiry)
  }

  /**
   * Checks if a token is expired or not.
   * @param  expiry - The expiry date in the ISO 8601 format.
   * @return `true` when the token is expired.
   */
  isTokenExpired(expiry: string): boolean {
    return isAfter(new Date(), parseISO(expiry))
  }

  /**
   * Generates the authorization state containing a random value and a PKCE code verifier and challenge using SHA-256.
   * @return The authorization state.
   */
  async generateAuthState(): Promise<AuthState> {
    const pkce = await getPkce()

    this.authState = { ...pkce, random: nanoid() }

    return this.authState
  }
}

export type DestinationId = string

export interface DestinationConfiguration {
  alwaysAvailable: boolean
  id: DestinationId
  name: string
}

export interface ShareResponse {
  anon: boolean
  date: Date
  deleteId?: string
  destinationId: string
  dimensions: ImageDimensions
  link: string
  path: string
  shareId: string | number
  size: number
}

interface DestinationShareResponse extends Pick<ShareResponse, 'anon' | 'link' | 'deleteId'> {
  id: ShareResponse['shareId']
}

interface AuthState extends PkceCode {
  random: string
}

/**
 * The settings of a destination.
 */
export type DestinationSettingValue = Optional<string | number | boolean>
export type DestinationSettings = Record<string, DestinationSettingValue>

export type DestinationSettingsGetter = <Settings extends DestinationSettings>() => Settings
export type DestinationSettingSetter = <Settings extends DestinationSettings>(
  settingId: KnownKeys<Settings>,
  value: DestinationSettingValue
) => void

export type GetDestinationSettingsGetter = (id: DestinationId) => DestinationSettingsGetter
export type GetDestinationSettingsSetter = (id: DestinationId) => DestinationSettingSetter

/**
 * Options that can be customized by a destination before sharing an image.
 */
export type ShareOptionValue = Optional<string | number | boolean>
export type ShareOptions = Record<string, ShareOptionValue>

export type ShareOptionSetter = <DestinationShareOptions extends ShareOptions>(
  key: KnownKeys<DestinationShareOptions>,
  value: ShareOptionValue
) => void
