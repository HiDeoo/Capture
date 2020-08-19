import { useEffect } from 'react'

/**
 * Mapping between well known keys and their associated symbols.
 */
const KeySymbolMap: Record<string, string> = {
  AltLeft: '⌥',
  AltRight: '⌥',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  Bacskpace: '⌫',
  ControlLeft: '⌃',
  ControlRight: '⌃',
  Delete: '⌦',
  End: '⤓',
  Enter: '↩',
  Escape: '⎋',
  Home: '⤒',
  MetaLeft: '⌘',
  MetaRight: '⌘',
  Space: '⎵',
  PageDown: '⇟',
  PageUp: '⇞',
  ShiftLeft: '⇧',
  ShiftRight: '⇧',
  Tab: '⭾',
}

/**
 * Defines keybaord shortcuts and their associated handlers using a React hook.
 * @param shortcuts - An object containing callbacks to trigger when a known shortcut is detected keyed by their
 * shortcut key bindings. Key bindings should match a `KeyboardEvent.code`
 * (https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code). As event listeners are added/removed using
 * `React.useEffect()`, if the callback has a dependency list, it should be wrapped in `React.useCallback()`.
 * @param target - The event listener target.
 */
export function useShortcut(
  shortcuts: Record<string, (event: KeyboardEvent) => void>,
  userOptions?: ShortcutHookOptions
): void {
  useEffect(() => {
    function onKeyDown(event: Event): void {
      // Ignore unrelated events.
      if (!(event instanceof KeyboardEvent)) {
        return
      }

      // Ignore modifier keys.
      if (event.getModifierState(event.key)) {
        return
      }

      if (shortcuts[event.code]) {
        shortcuts[event.code](event)
      }
    }

    const options: Required<ShortcutHookOptions> = { target: window, useCapture: false, ...userOptions }

    options.target.addEventListener('keydown', onKeyDown, options.useCapture)

    return () => {
      options.target.removeEventListener('keydown', onKeyDown, options.useCapture)
    }
  }, [shortcuts, userOptions])
}

/**
 * Parses a shortcut.
 * @param  shortcut - The shortcut to parse.
 * @return The individual shortcut keys.
 */
export function parseShortcut(shortcut: string): string[] {
  return shortcut.split('+')
}

/**
 * Formats a key so it can be displayed using known symbols if needed.
 * @param  key - The key to format.
 * @return The formatted key.
 */
export function formatKey(key: string): string {
  return KeySymbolMap[key.trim()] ?? key
}

interface ShortcutHookOptions {
  target?: HTMLElement | Window
  useCapture?: boolean
}
