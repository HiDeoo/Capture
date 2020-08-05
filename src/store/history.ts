import { action, observable } from 'mobx'
import { nanoid } from 'nanoid'

import type { ShareResponse } from '../destinations/DestinationBase'

/**
 * The history store.
 */
export default class HistoryStore {
  /**
   * History entries in reverse-chronological order.
   */
  @observable entries: HistoryEntry[] = []

  /**
   * Selected history entry.
   */
  @observable selectedEntry: Optional<HistoryEntry>

  /**
   * Adds an entry to the history based on a share response.
   * @param shareResponse - The share response.
   */
  @action
  addToHistory = (shareResponse: ShareResponse): void => {
    this.entries.unshift({ ...shareResponse, id: nanoid() })
  }

  /**
   * Removes all entries from the history.
   */
  @action
  clearHistory = (): void => {
    this.entries = []
  }

  /**
   * Sets the selected history entry.
   * @param entry - The new selected history entry or `undefined` to remove the current selection.
   */
  @action
  selectEntry = (entry: Optional<HistoryEntry>): void => {
    this.selectedEntry = entry
  }
}

export interface HistoryEntry extends ShareResponse {
  id: string
}
