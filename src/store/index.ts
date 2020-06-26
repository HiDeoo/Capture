import localforage from 'localforage'
import { configure } from 'mobx'
import { AsyncStorage, AsyncTrunk } from 'mobx-sync'
import React from 'react'

import RootStore from './root'
import type SettingsStore from './settings'

import 'mobx-react-lite/batchingForReactDom'

/**
 * The root store instance.
 */
const rootStore = new RootStore()

/**
 * Various React contexts containing the individual stores.
 */
const settingsContext = React.createContext(rootStore.settingsStore)

/**
 * Various hooks to access the stores using React context.
 */
export const useSettings = (): SettingsStore => React.useContext(settingsContext)

/**
 * The asynchronous trunk used to auto load/persist parts of the store to local storage.
 */
const trunk = new AsyncTrunk(rootStore, {
  storage: localforage as AsyncStorage,
  storageKey: '__capture__',
})

/**
 * Initializes the store by loading persisted data if any.
 */
export function initStore(): void {
  // Load the persisted store.
  void trunk.init()
}

// Configure MobX to enforce strict mode.
configure({
  enforceActions: 'always',
})
