import { observable, action } from 'mobx'

/**
 * The settings store.
 */
export default class SettingsStore {
  // TODO Clean
  @observable test1 = 0

  @action
  bumpTest1 = (): void => {
    this.test1++
  }
}
