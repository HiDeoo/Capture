/**
 * Abstract definition of a destination.
 */
export default abstract class Destination {
  /**
   * Returns the destination configuration.
   */
  abstract getConfiguration(): DestinationConfiguration
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
