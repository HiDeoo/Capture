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
   * Share a file to the destination.
   * @param filePath - The path of the file to share.
   */
  abstract share(filePath: string, destinationSettings: DestinationSettings): Promise<void>

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
}

export type DestinationId = string

export interface DestinationConfiguration {
  id: DestinationId
  name: string
}

/**
 * The default settings of a destination.
 */
export type DestinationSettingValue = Optional<string | number | boolean>
export type DestinationSettings = Record<string, DestinationSettingValue>
