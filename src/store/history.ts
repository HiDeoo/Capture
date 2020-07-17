import { action, observable } from 'mobx'
import { nanoid } from 'nanoid'

import { ShareResponse } from '../utils/Destination'

/**
 * The history store.
 */
export default class HistoryStore {
  /**
   * History entries in reverse-chronological order.
   */
  @observable entries: HistoryEntry[] = []

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
}

export interface HistoryEntry extends ShareResponse {
  id: string
}
