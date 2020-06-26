import AppStore from './app'
import SettingsStore from './settings'

/**
 * The root store of the application.
 */
export default class RootStore {
  /**
   * The different stores of the application.
   */
  appStore: AppStore
  settingsStore: SettingsStore

  /**
   * Creates a new instance of the root store.
   * @class
   */
  constructor() {
    this.appStore = new AppStore()
    this.settingsStore = new SettingsStore()
  }
}
