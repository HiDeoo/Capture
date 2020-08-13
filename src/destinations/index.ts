import Destination, { DestinationId, DestinationSettings } from './DestinationBase'
import Imgur from './Imgur'

/**
 * Imported destinations.
 */
const rawDestinations = [Imgur]

/**
 * A lazy-loaded list of sanitized destinations.
 * This should not be used directly, use `getDestinations()` instead.
 * @see getDestinations()
 */
let destinations: DestinationsList

/**
 * Returns all destinations.
 * @return The destinations.
 */
export function getDestinations(): DestinationsList {
  if (!destinations) {
    loadDestinations()
  }

  return destinations
}

/**
 * Returns a destination based on its ID.
 * @param  id - The destination ID.
 * @return The destination.
 */
export function getDestination(id: DestinationId): Destination {
  return getDestinations()[id]
}

/**
 * Returns all destinations default settings.
 * @return The destinations default settings.
 */
export function getDestinationsDefaultSettings(): DestinationsSettings {
  return Object.entries(getDestinations()).reduce((acc, [id, destination]) => {
    const defaultSettings = destination.getDefaultSettings()

    acc[id] = defaultSettings

    return acc
  }, {} as DestinationsSettings)
}

/**
 * Loads and sanitizes imported destinations.
 */
function loadDestinations(): void {
  destinations = rawDestinations.reduce((acc, destination) => {
    const configuration = destination.getConfiguration()
    acc[configuration.id] = destination

    return acc
  }, {} as typeof destinations)
}

/**
 * List of available destinations.
 */
type DestinationsList = Record<DestinationId, Destination>

/**
 * List of all destinations default settings.
 */
export type DestinationsSettings = Record<DestinationId, DestinationSettings>
