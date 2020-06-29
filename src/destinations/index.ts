import importAll from 'import-all.macro'

import Destination, { DestinationId, DestinationSettings } from '../libs/Destination'

/**
 * Imported destinations.
 */
const rawDestinations = importAll.sync<Record<string, { default: Destination }>>('./*.ts')

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
 * Returns all destinations default settings.
 */
export function getDestinationsDefaultSettings(): DestinationsSettings {
  return Object.entries(getDestinations()).reduce((acc, [id, destination]) => {
    acc[id] = destination.getDefaultSettings()

    return acc
  }, {} as DestinationsSettings)
}

/**
 * Loads and sanitizes imported destinations.
 */
function loadDestinations(): void {
  destinations = Object.entries(rawDestinations).reduce((acc, [filename, module]) => {
    if (!filename.endsWith('index.ts')) {
      const destination = module.default
      const configuration = destination.getConfiguration()
      acc[configuration.id] = destination
    }

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
