import { action, observable } from 'mobx'
import { ignore } from 'mobx-sync'
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
   * Defines if we have a selected history entry.
   */
  @ignore @observable hasSelectedEntry = false

  /**
   * Selected history entry.
   * Note: when clearing the selected entry, we do not clear this variable. Use `hasSelectedEntry` to check if an entry
   * is selected or not.
   * @see hasSelectedEntry
   */
  @ignore @observable selectedEntry: Optional<HistoryEntry>

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
   * @param entry - The new selected history entry.
   */
  @action
  selectEntry = (entry: HistoryEntry): void => {
    this.hasSelectedEntry = true
    this.selectedEntry = entry
  }

  /**
   * Clears the selected entry.
   * Note: we don't clear the reference to the previous selected entry.
   * @see hasSelectedEntry
   */
  @action
  clearSelectedEntry = (): void => {
    this.hasSelectedEntry = false
  }
}

export interface HistoryEntry extends ShareResponse {
  id: string
}
