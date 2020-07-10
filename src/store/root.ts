import { getDestinationsDefaultSettings } from '../destinations'
import AppStore from './app'
import HistoryStore from './history'
import SettingsStore from './settings'

/**
 * The root store of the application.
 */
export default class RootStore {
  /**
   * The different stores of the application.
   */
  appStore: AppStore
  historyStore: HistoryStore
  settingsStore: SettingsStore

  /**
   * Creates a new instance of the root store.
   * @class
   */
  constructor() {
    this.appStore = new AppStore()
    this.historyStore = new HistoryStore()
    this.settingsStore = new SettingsStore(getDestinationsDefaultSettings())
  }
}
