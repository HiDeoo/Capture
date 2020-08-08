import { formatISO, parseISO } from 'date-fns'
import { action, observable } from 'mobx'
import { format, ignore } from 'mobx-sync'
import { nanoid } from 'nanoid'

import type { ShareResponse } from '../destinations/DestinationBase'

/**
 * The history store.
 */
export default class HistoryStore {
  /**
   * History entries in reverse-chronological order.
   */
  @format<HistoryEntry[], SerializedHistoryEntry[]>(
    (data) => data.map((serializedEntry) => ({ ...serializedEntry, date: parseISO(serializedEntry.date) })),
    (value) => value.map((entry) => ({ ...entry, date: formatISO(entry.date) }))
  )
  @observable
  entries: HistoryEntry[] = []

  /**
   * History selection.
   */
  @ignore @observable selection: HistorySelection = { current: undefined, previous: undefined }

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
   * @param entry - The new selected history entry or `undefined` to clear the current selection.
   */
  @action
  selectEntry = (entry: Optional<HistoryEntry>): void => {
    this.selection.previous = this.selection.current
    this.selection.current = entry
  }
}

export interface HistoryEntry extends ShareResponse {
  id: string
}

export interface HistorySelection {
  current: Optional<HistoryEntry>
  previous: Optional<HistoryEntry>
}

interface SerializedHistoryEntry extends Omit<HistoryEntry, 'date'> {
  date: string
}
