import { action, computed, observable } from 'mobx'

import { DestinationsSettings, getDestination, getDestinations, isDestinationAvailable } from '../destinations'
import type {
  DestinationId,
  DestinationSettings,
  DestinationSettingValue,
  GetDestinationSettingsGetter,
  GetDestinationSettingsSetter,
} from '../destinations/DestinationBase'
import { ShortcutId } from '../utils/keyboard'

/**
 * The default destination ID to use when no default is configured by the user or the configured default is no longer
 * available.
 */
const DefaultDestinationId = Object.keys(getDestinations())[0]

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
   * The default destination ID.
   * Note: the destination can potentially be no longer available.
   */
  @observable private _defaultDestinationId = DefaultDestinationId

  /**
   * Returns the default destination ID or a fallback if the user configured default destination is no longer available.
   */
  @computed
  get defaultDestinationId(): DestinationId {
    const destination = getDestination(this._defaultDestinationId)

    if (isDestinationAvailable(destination, this.getDestinationSettingsGetter)) {
      return this._defaultDestinationId
    }

    return DefaultDestinationId
  }

  /**
   * Sets the default destination ID.
   * @param destinationId - The new default destination ID.
   */
  @action
  setDefaultDestinationId = (destinationId: DestinationId): void => {
    this._defaultDestinationId = destinationId
  }

  /**
   * All mutable shortcuts and their associated key bindings.
   */
  @observable shortcuts: Record<ShortcutId, string> = {
    [ShortcutId.CaptureScreenshot]: 'Meta+Shift+2',
  }

  /**
   * Updates a specific shortcut.
   * @param shortcutId - The user shortcut to modify.
   * @param newShortcut - The new shortcut.
   */
  @action
  updateShortcut = (shortcutId: ShortcutId, newShortcut: string): void => {
    this.shortcuts[shortcutId] = newShortcut
  }

  /**
   * Defines if share URLs should be automatically copied to the clipboard.
   */
  @observable copyShareUrlToClipboard = true

  /**
   * Sets if share URLs should be automatically copied to the clipboard.
   * @param copy - `true` when the URLs should be copied.
   */
  @action
  setCopyShareUrlToClipboard = (copy: boolean): void => {
    this.copyShareUrlToClipboard = copy
  }

  /**
   * Defines if the application window should be closed when done sharing.
   */
  @observable closeWindowAfterShare = true

  /**
   * Sets if the application window should be closed when done sharing.
   * @param close - `true` when the window should be closed.
   */
  @action
  setCloseWindowAfterShare = (close: boolean): void => {
    this.closeWindowAfterShare = close
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
  getDestinationSettingsGetter: GetDestinationSettingsGetter = (id: DestinationId) => {
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
  getDestinationSettingsSetter: GetDestinationSettingsSetter = (id: DestinationId) => {
    return <Settings extends DestinationSettings>(
      settingId: KnownKeys<Settings>,
      value: DestinationSettingValue
    ): void => {
      this.setDestinationSetting<Settings>(id, settingId, value)
    }
  }
}
