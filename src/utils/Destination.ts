/**
 * Abstract definition of a destination.
 */
export default abstract class Destination {
  /**
   * Returns the destination configuration.
   */
  abstract getConfiguration(): DestinationConfiguration

  /**
   * Returns the destination default settings.
   */
  abstract getDefaultSettings(): DestinationSettings

  /**
   * Share a file to the destination.
   * @param filePath - The path of the file to share.
   */
  abstract share(filePath: string): Promise<void>
}

/**
 * A type representing a destination ID.
 */
export type DestinationId = string

/**
 * The configuration of a destination.
 */
export interface DestinationConfiguration {
  id: DestinationId
  name: string
}

/**
 * The default settings of a destination.
 */
export type DestinationSettingValue = string | number | boolean
export type DestinationSettings = Record<string, DestinationSettingValue>
