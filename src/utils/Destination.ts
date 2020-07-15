import type { SettingsPanelProps } from '../components/SettingsPanel'
import type { DestinationToolBarProps } from '../components/ToolBar'

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
   * Returns the destination default share options.
   * @param  settings - The destination settings.
   * @return The default share options.
   */
  abstract getDefaultShareOptions?(settings: DestinationSettings): ShareOptions

  /**
   * Share a file to the destination.
   * @param filePath - The path of the file to share.
   * @param destinationSettings - The destination settings.
   * @param shareOptions - The options related to this specific share.
   */
  abstract share(filePath: string, destinationSettings: DestinationSettings, shareOptions: ShareOptions): Promise<void>

  /**
   * Returns the destination settings panel if any.
   * @return The settings panel.
   */
  abstract getSettingsPanel?(): React.FC<SettingsPanelProps>

  /**
   * Returns the destination toolbar if any.
   * @return The destination toolbar visible in the editor.
   */
  abstract getToolBar?(): React.FC<DestinationToolBarProps>

  /**
   * Triggered when an associated OAuth request is received for the destination.
   */
  abstract onOAuthRequest?(
    setSettings: SettingsPanelProps['setSettings'],
    queryString: ParsedQueryString,
    hash: Optional<ParsedQueryString>
  ): void

  /**
   * Fetches the blob of raw data for a specific file.
   * @param  filePath - The path of the file.
   * @return The blob.
   */
  async getFileBlob(filePath: string): Promise<Blob> {
    const response = await fetch(`file://${filePath}`)
    return response.blob()
  }
}

export type DestinationId = string

export interface DestinationConfiguration {
  id: DestinationId
  name: string
}

/**
 * The settings of a destination.
 */
export type DestinationSettingValue = Optional<string | number | boolean>
export type DestinationSettings = Record<string, DestinationSettingValue>

/**
 * Share options that can be customized by a destination before sharing an image.
 */
export type ShareOptionValue = Optional<string | number | boolean>
export type ShareOptions = Record<string, ShareOptionValue>
