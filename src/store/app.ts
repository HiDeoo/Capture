import { action, computed, observable } from 'mobx'
import { ignore } from 'mobx-sync'

/**
 * The app store.
 */
export default class AppStore {
  /**
   * The pending screenshot queue.
   */
  @ignore @observable private queue: string[] = []

  /**
   * Defines if the application should show the editor which means there are pending screenshots.
   */
  @computed
  get shouldShowEditor(): boolean {
    return this.queue.length > 0
  }

  /**
   * Returns the first element of the queue.
   * @return The current pending screenshot.
   */
  @computed
  get pendingScreenshot(): string {
    if (this.queue.length > 0) {
      return this.queue[0]
    }

    throw new Error('Error while trying to access a pending screenshot in an empty queue.')
  }

  /**
   * Adds a new screenshot at the end of the queue.
   * @param filePath - The new screenshot file path.
   */
  @action
  pushToQueue = (filePath: string): void => {
    this.queue.push(filePath)
  }

  /**
   * Removes the first item of the queue.
   */
  @action
  shiftFromQueue = (): void => {
    this.queue.shift()
  }
}
