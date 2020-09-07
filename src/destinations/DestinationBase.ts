import { addSeconds, formatISO } from 'date-fns'
import { lookup } from 'mime-types'
import wretch, { Wretcher } from 'wretch'

import { AppError, DestinationError, ErrorHandler } from '../components/ErrorBoundary'
import type { ImageDimensions } from '../components/Img'
import type { SettingsPanelProps } from '../components/SettingsPanel'
import type { DestinationToolBarProps } from '../components/ToolBar'
import type { HistoryEntry } from '../store/history'
import { splitFilePath } from '../utils/string'

export type { DestinationToolBarProps, ErrorHandler, HistoryEntry, ImageDimensions, SettingsPanelProps }
export { AppError, DestinationError }

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
   * Checks if the destination is available or not.
   * @param getSettings - A destination settings getter.
   */
  isAvailable?(getSettings: DestinationSettingsGetter): boolean

  /**
   * Triggered when an associated OAuth request is received for the destination.
   */
  onOAuthRequest?(
    setSettings: DestinationSettingSetter,
    queryString: ParsedQueryString,
    hash: Optional<ParsedQueryString>,
    handleError: ErrorHandler
  ): void

  private wretcher: Wretcher

  /**
   * Creates a new instance of the destination.
   * @class
   */
  constructor(private readonly baseUrl: string) {
    this.wretcher = wretch(baseUrl)
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
