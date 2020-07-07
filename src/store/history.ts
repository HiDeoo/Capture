import { observable, action } from 'mobx'

/**
 * The history store.
 */
export default class HistoryStore {
  /**
   * History entries in reverse-chronological order.
   */
  @observable entries: HistoryEntry[] = []

  /**
   * Adds an entry to the history.
   * @param entry - The entry to add to the history.
   */
  @action
  addToHistory = (entry: HistoryEntry): void => {
    this.entries.push(entry)
  }

  /**
   * Removes all entries from the history.
   */
  @action
  clearHistory = (): void => {
    this.entries = []
  }
}

/**
 * Interface describing an history entry.
 */
export interface HistoryEntry {
  path: string
}
