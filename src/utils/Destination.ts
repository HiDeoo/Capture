import wretch, { Wretcher } from 'wretch'

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
   * Share a file to the destination.
   * @param  path - The path of the file to share.
   * @param  shareOptions - The options related to this specific share.
   * @param  getSettings - A destination settings getter.
   * @param  setSettings - A destination settings setter.
   * @return An object containing informations regarding the completed share.
   */
  abstract share(
    path: string,
    shareOptions: ShareOptions,
    getSettings: DestinationSettingsGetter,
    setSettings: DestinationSettingSetter
  ): Promise<ShareResponse>

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
   * Returns a complete share response based on informations provided by a destination after a share.
   * @param  path - The path of the shared file.
   * @param  partialResponse - Informations known by a destination after a share.
   * @return The share response.
   */
  getShareResponse(path: string, partialResponse: Pick<ShareResponse, 'id' | 'link' | 'deleteLink'>): ShareResponse {
    return {
      ...partialResponse,
      date: new Date(),
      destinationId: this.getConfiguration().id,
      path,
    }
  }
}

export type DestinationId = string

export interface DestinationConfiguration {
  id: DestinationId
  name: string
}

export type ShareResponse = {
  id: string | number
  date: Date
  deleteLink?: string
  destinationId: string
  link: string
  path: string
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
 * Share options that can be customized by a destination before sharing an image.
 */
export type ShareOptionValue = Optional<string | number | boolean>
export type ShareOptions = Record<string, ShareOptionValue>

export type ShareOptionSetter = <DestinationShareOptions extends ShareOptions>(
  key: KnownKeys<DestinationShareOptions>,
  value: ShareOptionValue
) => void
