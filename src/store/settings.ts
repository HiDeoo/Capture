import { action, observable } from 'mobx'

import { DestinationsSettings, getDestination } from '../destinations'
import type { DestinationId, DestinationSettings, DestinationSettingValue } from '../destinations/DestinationBase'
import { UserShortcut } from '../utils/keyboard'

/**
 * The settings store.
 */
export default class SettingsStore {
  /**
   * Creates a new instance of the sources store.
   * @class
   */
  constructor(destinationsSettings: DestinationsSettings) {
    this.destinations = destinationsSettings
  }

  /**
   * The path of the directory used to save screenshots.
   */
  @observable screenshotDirectory = ''

  /**
   * Updates the screenshot directory path.
   * @param newPath - The new path.
   */
  @action
  setScreenshotDirectory = (newPath: string): void => {
    this.screenshotDirectory = newPath
  }

  /**
   * All mutable shortcuts and their associated key bindings.
   */
  @observable shortcuts: Record<UserShortcut, string> = {
    [UserShortcut.CaptureScreenshot]: 'Meta+b',
  }

  /**
   * Updates a specific shortcut.
   * @param userShortcut - The user shortcut to modify.
   * @param newShortcut - The new shortcut.
   */
  @action
  updateShortcut = (userShortcut: UserShortcut, newShortcut: string): void => {
    this.shortcuts[userShortcut] = newShortcut
  }

  /**
   * Destinations individual settings keyed by destination ID.
   */
  @observable private destinations: DestinationsSettings

  /**
   * Returns the settings of a specific destination.
   * @param  id - The destination ID.
   * @return The destination settings.
   */
  getDestinationSettings = <Settings extends DestinationSettings>(id: DestinationId): Settings => {
    const settings = this.destinations[id] as Optional<Settings>

    if (settings) {
      return settings
    }

    return getDestination(id).getDefaultSettings() as Settings
  }

  /**
   * Returns a destination-scoped settings getter.
   * @param id - The destination ID.
   */
  getDestinationSettingsGetter = (id: DestinationId) => {
    return <Settings extends DestinationSettings>(): Settings => {
      return this.getDestinationSettings<Settings>(id)
    }
  }

  /**
   * Changes the value of a specific setting for a destination.
   * @param id - The destination ID.
   * @param settingId -The setting ID.
   * @param value - The new setting value.
   */
  @action
  private setDestinationSetting = <Settings extends DestinationSettings>(
    id: DestinationId,
    settingId: KnownKeys<Settings>,
    value: DestinationSettingValue
  ): void => {
    this.destinations[id][settingId as string] = value
  }

  /**
   * Returns a destination-scoped settings setter.
   * @param id - The destination ID.
   */
  getDestinationSettingsSetter = (id: DestinationId) => {
    return <Settings extends DestinationSettings>(
      settingId: KnownKeys<Settings>,
      value: DestinationSettingValue
    ): void => {
      this.setDestinationSetting<Settings>(id, settingId, value)
    }
  }
}
