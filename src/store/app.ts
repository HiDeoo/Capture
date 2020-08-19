import { action, computed, observable } from 'mobx'
import { ignore } from 'mobx-sync'

// import { GeneralSettingsConfiguration } from '../components/GeneralSettings'
import { ShortcutsSettingConfiguration } from '../components/ShortcutsSettings'

/**
 * The various panels available in the application.
 */
export enum Panel {
  Library,
  Editor,
  Settings,
}

/**
 * The app store.
 */
export default class AppStore {
  /**
   * The current application panel to display.
   */
  @ignore @observable currentPanel: Panel = Panel.Settings

  /**
   * Changes the current panel.
   */
  @action
  setCurrentPanel = (newPanel: Panel): void => {
    this.currentPanel = newPanel
  }

  /**
   * The ID of the current settings panel to display.
   */
  @ignore @observable currentSettingsPanel: SettingsPanelId = ShortcutsSettingConfiguration.id

  /**
   * Changes the ID of the current settings panel.
   */
  @action
  setCurrentSettingsPanel = (newPanelId: SettingsPanelId): void => {
    this.currentSettingsPanel = newPanelId
  }

  /**
   * The pending screenshot queue.
   */
  @ignore @observable private queue: PendingScreenshot[] = []

  /**
   * Defines if there are pending screenshots in the queue.
   */
  @computed
  get hasPendingScreenshots(): boolean {
    return this.queue.length > 0
  }

  /**
   * Returns the first pending screenshot in the queue.
   * @return The current pending screenshot.
   */
  @computed
  get pendingScreenshot(): PendingScreenshot {
    if (this.queue.length > 0) {
      return this.queue[0]
    }

    throw new Error('Error while trying to access a pending screenshot in an empty queue.')
  }

  /**
   * Adds a new screenshot at the end of the queue.
   * @param path - The new screenshot file path.
   * @param size - The new screenshot file size.
   */
  @action
  pushToQueue = (path: string, size: number): void => {
    this.queue.push({ path, size })

    this.setCurrentPanel(Panel.Editor)
  }

  /**
   * Removes the first item of the queue.
   */
  @action
  shiftFromQueue = (): void => {
    this.queue.shift()

    if (!this.hasPendingScreenshots) {
      this.setCurrentPanel(Panel.Library)
    }
  }

  /**
   * Defines if the application is focused or not.
   */
  @ignore @observable isFocused = false

  /**
   * Sets if the application window is focused or not.
   * @param isFocused - Defines if the window is focused or not.
   */
  @action
  setWindowFocus = (isFocused: boolean): void => {
    this.isFocused = isFocused
  }

  /**
   * Defines if the UI should be locked or not (eg. during a network request while sending a screenshot).
   */
  @ignore @observable isUiLocked = false

  /**
   * Locks or unlocks the UI.
   * @param locked - `true` when the UI should be locked.
   */
  @action
  lockUi = (locked = true): void => {
    this.isUiLocked = locked
  }
}

/**
 * The type representing a settings panel ID.
 */
export type SettingsPanelId = string

interface PendingScreenshot {
  path: string
  size: number
}
