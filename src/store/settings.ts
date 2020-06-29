import { observable, action } from 'mobx'

import type { DestinationsSettings } from '../destinations'
import type { DestinationId, DestinationSettings, DestinationSettingValue } from '../libs/Destination'

/**
 * The settings store.
 */
export default class SettingsStore {
  /**
   * Destinations individual settings keyed by destination ID.
   */
  @observable private destinations: DestinationsSettings

  /**
   * Creates a new instance of the sources store.
   * @class
   */
  constructor(destinationsSettings: DestinationsSettings) {
    this.destinations = destinationsSettings
  }

  /**
   * Returns the settings of a specific destination.
   * @param  id - The destination ID.
   * @return The destination settings.
   */
  getDestinationSettings = <Settings extends DestinationSettings>(id: DestinationId): Settings => {
    return this.destinations[id] as Settings
  }

  /**
   * Changes the value of a specific setting for a destination.
   * @param id - The destination ID.
   * @param settingId -The setting ID.
   * @param value - The new setting value.
   */
  @action
  setDestinationSetting = <Settings extends DestinationSettings>(
    id: DestinationId,
    settingId: KnownKeys<Settings>,
    value: DestinationSettingValue
  ): void => {
    this.destinations[id][settingId as string] = value
  }
}
