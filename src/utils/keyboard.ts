import { useEffect } from 'react'

/**
 * IDs of all user customizable shortcuts.
 */
export enum ShortcutId {
  CaptureScreenshot = 'capture_screenshot',
}

/**
 * List of keyboard modifiers.
 */
const ShortcutModifiers = ['Meta', 'Control', 'Alt', 'Shift']

/**
 * Mapping between well known keys and their associated symbols.
 */
const KeySymbolMap: Record<string, string> = {
  Alt: '⌥',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  Backspace: '⌫',
  ContextMenu: '☰',
  Control: '⌃',
  Delete: '⌦',
  End: '⤓',
  Enter: '⏎',
  Escape: '⎋',
  Home: '⤒',
  Meta: '⌘',
  Space: '⎵',
  PageDown: '⇟',
  PageUp: '⇞',
  Plus: '+',
  Shift: '⇧',
  Tab: '⭾',
}

/**
 * Ordered list of editor shortcuts.
 */
export const EditorShortcuts: ShortcutList = {
  editor_share: { label: 'Share', shortcut: 'Meta+Enter' },
  editor_cancel: { label: 'Cancel', shortcut: 'Meta+Escape' },
  editor_pencil: { label: 'Pencil', shortcut: '1' },
  editor_arrow: { label: 'Arrow', shortcut: '2' },
  editor_rectangle: { label: 'Rectangle', shortcut: '3' },
  editor_circle: { label: 'Circle', shortcut: '4' },
  editor_line: { label: 'Line', shortcut: '5' },
  editor_delete_selection: { label: 'Delete selection', shortcut: 'Backspace' },
  editor_undo: { label: 'Undo', shortcut: 'Meta+Z' },
  editor_redo: { label: 'Redo', shortcut: 'Meta+Shift+Z' },
}

/**
 * Defines keybaord shortcuts and their associated handlers using a React hook.
 * @param shortcuts - An object containing callbacks to trigger when a known shortcut is detected keyed by their
 * shortcut key bindings.
 *
 * Key bindings should either match:
 *  - a `KeyboardEvent.code` (https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code).
 *  - a `KeyboardEvent.key` (https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) if the
 *      `userOptions.useCode` is set to `false`.
 *
 * As event listeners are added/removed using `React.useEffect()`, if the callback has a dependency list, it should be
 * wrapped in `React.useCallback()`.
 * @param target - The event listener target.
 */
export function useShortcut(
  shortcuts: Record<string, (event: KeyboardEvent) => void>,
  userOptions?: ShortcutHookOptions
): void {
  useEffect(() => {
    const options: Required<ShortcutHookOptions> = { target: window, useCapture: false, useCode: true, ...userOptions }

    function onKeyDown(event: Event): void {
      // Ignore unrelated events.
      if (!(event instanceof KeyboardEvent)) {
        return
      }

      // Ignore modifier keys.
      if (event.getModifierState(event.key)) {
        return
      }

      if (options.useCode && shortcuts[event.code]) {
        shortcuts[event.code](event)
      } else if (!options.useCode) {
        const key = event.key.toLowerCase()

        if (shortcuts[key]) {
          shortcuts[key](event)
        }
      }
    }

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
  if (shortcut.length === 0) {
    return []
  }

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

/**
 * Composes a shortcut from a keybord event.
 * @param  event - The keyboard event.
 * @return The shortcut.
 */
export function getShortcutFromEvent(event: KeyboardEvent): NewShortcut {
  let valid = false
  let value = ''

  if (event.key === 'Dead' || event.key === 'Clear') {
    return { valid, value }
  }

  // Idendify shortcuts that are only composed of modifiers.
  valid = !ShortcutModifiers.includes(event.key)

  if (event.metaKey) {
    value = value.concat('Meta+')
  }

  if (event.ctrlKey) {
    value = value.concat('Control+')
  }

  if (event.altKey) {
    value = value.concat('Alt+')
  }

  if (event.shiftKey) {
    value = value.concat('Shift+')
  }

  if (!valid) {
    if (value.endsWith('+')) {
      value = value.slice(0, -1)
    }
  } else {
    if (event.key === ' ') {
      value = value.concat(KeySymbolMap['Space'])
    } else if (event.key === '+') {
      value = value.concat('Plus')
    } else {
      value = value.concat(event.key)
    }
  }

  return { valid, value }
}

/**
 * Returns an editor shortcut based on its ID.
 * @param id - The shortcut ID.
 * @return
 */
export function getEditorShortcut(id: keyof typeof EditorShortcuts): string {
  return parseShortcut(EditorShortcuts[id].shortcut)
    .map((key) => formatKey(key))
    .join('+')
}

interface ShortcutHookOptions {
  target?: HTMLElement | Window
  useCapture?: boolean
  useCode?: boolean
}

export interface NewShortcut {
  valid: boolean
  value: string
}

type ShortcutList = Record<
  string,
  {
    label: string
    shortcut: string
  }
>
