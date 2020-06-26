import SettingsStore from './settings'

/**
 * The root store of the application.
 */
export default class RootStore {
  /**
   * The different stores of the application.
   */
  settingsStore: SettingsStore

  /**
   * Creates a new instance of the root store.
   * @class
   */
  constructor() {
    this.settingsStore = new SettingsStore()
  }
}
