import wretch, { Wretcher } from 'wretch'

import type { ImageDimensions } from '../components/Img'
import type { SettingsPanelProps } from '../components/SettingsPanel'
import type { DestinationToolBarProps } from '../components/ToolBar'

export type { DestinationToolBarProps, SettingsPanelProps }

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
   * @param deleteOptions - The options related to this specific deletion.
   * @param getSettings - A destination settings getter.
   * @param setSettings - A destination settings setter.
   */
  abstract delete(
    deleteOptions: DeleteOptions,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<void>

  /**
   * Returns the destination settings panel if any.
   * @return The settings panel.
   */
  abstract getSettingsPanel?(): React.FC<SettingsPanelProps>

  /**
   * Returns the destination toolbar if any.
   * @return The destination toolbar visible in the editor.
   */
  abstract getToolBar?(): React.FC<DestinationToolBarProps<ShareOptions>>

  /**
   * Triggered when an associated OAuth request is received for the destination.
   */
  abstract onOAuthRequest?(
    setSettings: DestinationSettingSetter,
    queryString: ParsedQueryString,
    hash: Optional<ParsedQueryString>
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
    return response.blob()
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
}

export type DestinationId = string

export interface DestinationConfiguration {
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

/**
 * Options that can be customized by a destination before sharing or deleting an image.
 */
export type ShareOptionValue = Optional<string | number | boolean>
export type ShareOptions = Record<string, ShareOptionValue>
export type DeleteOptions = Record<string, ShareOptionValue>

export type ShareOptionSetter = <DestinationShareOptions extends ShareOptions>(
  key: KnownKeys<DestinationShareOptions>,
  value: ShareOptionValue
) => void
