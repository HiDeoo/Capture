import { formatISO, parseISO } from 'date-fns'
import { action, computed, observable } from 'mobx'
import { format, ignore } from 'mobx-sync'
import { nanoid } from 'nanoid'

import type { ShareResponse } from '../destinations/DestinationBase'

/**
 * The history store.
 */
export default class HistoryStore {
  /**
   * Internal store of history entries with IDs in reverse-chronological order.
   */
  @format<HistoryEntries, SerializedHistoryEntries>(
    (data) => {
      return {
        allIds: data.allIds,
        byId: Object.entries(data.byId).reduce((acc, [id, entry]) => {
          acc[id] = { ...entry, date: parseISO(entry.date) }

          return acc
        }, {} as HistoryEntries['byId']),
      }
    },
    (value) => {
      return {
        allIds: value.allIds,
        byId: Object.entries(value.byId).reduce((acc, [id, entry]) => {
          acc[id] = { ...entry, date: formatISO(entry.date) }

          return acc
        }, {} as SerializedHistoryEntries['byId']),
      }
    }
  )
  @observable
  private _entries: HistoryEntries = { allIds: [], byId: {} }

  /**
   * History entries with IDs in reverse-chronological order.
   */
  @computed
  get entries(): HistoryEntries {
    return this._entries.allIds.reduce(
      (acc, id) => {
        const entry = this._entries.byId[id]

        if (!(entry.deleted.destination && entry.deleted.disk)) {
          acc.allIds.push(id)
        }

        return acc
      },
      { allIds: [], byId: this._entries.byId } as HistoryEntries
    )
  }

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
    const id = nanoid()

    this._entries.allIds.unshift(id)
    this._entries.byId[id] = {
      ...shareResponse,
      deleted: {
        destination: false,
        disk: false,
      },
      id,
    }
  }

  /**
   * Removes all entries from the history.
   */
  @action
  clearHistory = (): void => {
    this._entries = { allIds: [], byId: {} }
  }

  /**
   * Sets the selected history entry.
   * @param entry - The new selected history entry or none to clear the current selection.
   */
  @action
  selectEntry: SelectEntry = (entry) => {
    this.selection.previous = this.selection.current
    this.selection.current = entry
  }

  /**
   * Marks an history entry as deleted on disk.
   * @param entry - The deleted entry.
   */
  @action
  markAsDeletedOnDisk = (entry: HistoryEntry): void => {
    this._entries.byId[entry.id].deleted.disk = true
  }

  /**
   * Marks an history entry as deleted on its destination.
   * @param entry - The deleted entry.
   */
  @action
  markAsDeletedOnDestination = (entry: HistoryEntry): void => {
    this._entries.byId[entry.id].deleted.destination = true
  }
}

export interface HistoryEntry extends ShareResponse {
  deleted: {
    destination: boolean
    disk: boolean
  }
  id: string
}

export interface HistorySelection {
  current: Optional<HistoryEntry>
  previous: Optional<HistoryEntry>
}

interface SerializedHistoryEntry extends Omit<HistoryEntry, 'date'> {
  date: string
}

interface HistoryEntries {
  allIds: string[]
  byId: Record<string, HistoryEntry>
}

interface SerializedHistoryEntries extends Omit<HistoryEntries, 'byId'> {
  byId: Record<string, SerializedHistoryEntry>
}

export type SelectEntry = (entry?: HistoryEntry) => void
