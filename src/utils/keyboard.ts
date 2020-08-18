import { useEffect } from 'react'

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

interface ShortcutHookOptions {
  target?: HTMLElement | Window
  useCapture?: boolean
}
