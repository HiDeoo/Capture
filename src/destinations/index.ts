import Destination, { DestinationId, DestinationSettings, GetDestinationSettingsGetter } from './DestinationBase'
import Dropbox from './Dropbox'
import Imgur from './Imgur'
import OneDrive from './OneDrive'
import VgyMe from './VgyMe'

/**
 * Imported destinations.
 */
const rawDestinations = [Imgur, Dropbox, OneDrive, VgyMe]

/**
 * A lazy-loaded list of sanitized destinations.
 * This should not be used directly, use `getDestinations()` instead.
 * @see getDestinations()
 */
let destinations: DestinationsList

/**
 * Returns all destinations.
 * @param  availableOnly - Defines if only available destinations should be returned.
 * @param  getDestinationSettingsGetter - A getter for a destination settings getter.
 * @return The destinations.
 */
export function getDestinations(availableOnly?: false): DestinationsList
export function getDestinations(
  availableOnly: true,
  getDestinationSettingsGetter: GetDestinationSettingsGetter
): DestinationsList
export function getDestinations(
  availableOnly = false,
  getDestinationSettingsGetter?: GetDestinationSettingsGetter
): DestinationsList {
  if (!destinations) {
    loadDestinations()
  }

  if (!availableOnly) {
    return destinations
  }

  return Object.entries(destinations).reduce((acc, [id, destination]) => {
    if (getDestinationSettingsGetter && isDestinationAvailable(destination, getDestinationSettingsGetter)) {
      acc[id] = destination
    }

    return acc
  }, {} as typeof destinations)
}

/**
 * Checks if a destination is available.
 * @param  destination - The destination.
 * @param  getDestinationSettingsGetter - A getter for a destination settings getter.
 * @return `true` when the destination is available.
 */
export function isDestinationAvailable(
  destination: Destination,
  getDestinationSettingsGetter: GetDestinationSettingsGetter
): boolean {
  const configuration = destination.getConfiguration()

  return (
    configuration.alwaysAvailable ||
    (!configuration.alwaysAvailable &&
      typeof destination.isAvailable !== 'undefined' &&
      destination.isAvailable(getDestinationSettingsGetter(configuration.id)))
  )
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
