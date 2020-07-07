import { observable } from 'mobx'

/**
 * The history store.
 */
export default class HistoryStore {
  /**
   * History entries in reverse-chronological order.
   */
  // TODO Change type
  @observable entries: string[] = []
}
