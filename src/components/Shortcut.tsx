import React, { useEffect, useRef, useState } from 'react'
import { keyframes } from 'styled-components'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import { formatKey, getShortcutFromEvent, NewShortcut, parseShortcut, ShortcutId } from '../utils/keyboard'
import Theme from '../utils/theme'
import type { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'
import { Button } from './SettingsUi'

const PickerAnimation = keyframes`
  0%,
  30% {
    box-shadow: 0 0 0 2px ${Theme.settings.shortcut.focus.outline};
  }
  65% {
    box-shadow: 0 0 0 3px ${Theme.settings.shortcut.focus.alternate};
  }
  100% {
    box-shadow: 0 0 0 2px ${Theme.settings.shortcut.focus.outline};
  }
`

const Wrapper = tw.div`flex items-center`

const Key = styled.span`
  ${tw`mx-1 px-3 inline-block rounded shadow text-xs font-semibold last:mr-0 text-base`}

  background-color: ${theme('settings.shortcut.background')};
  padding-top: 0.15rem;
  padding-bottom: 0.15rem;
`

const Picker = styled(Button)<ButtonProps>`
  && {
    ${tw`mr-3 flex justify-end items-center px-2 flex-shrink-0`}

    height: 45px;
    min-width: 180px;

    &:hover:not(:disabled) {
      & ${Key} {
        background-color: ${theme('settings.shortcut.hover.background')};
      }
    }

    &:disabled {
      ${tw`justify-between`}

      opacity: 0.9;
    }

    &:focus {
      animation-duration: 1500ms;
      animation-iteration-count: infinite;
      animation-name: ${PickerAnimation};
      animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
    }
  }
`

const ReadOnlyIcon = tw(Icon)`block opacity-50`

const BlankNewShortcut: NewShortcut = { valid: false, value: '' }

const Shortcut: React.FC<ShortcutProps> = ({ label: name, onChange, shortcut, shortcutId }) => {
  const picker = useRef<HTMLButtonElement>(null)
  const [isPicking, setIsPicking] = useState(false)
  const [newShortcut, setNewShortcut] = useState<NewShortcut>(BlankNewShortcut)

  const readOnly = typeof onChange === 'undefined'
  const parsedShortcut = parseShortcut(isPicking ? newShortcut.value : shortcut)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      // Some keys should not be usabled while picking a shortcut and should cancel the picking phase.
      if (event.code === 'Escape' || event.code === 'Tab') {
        disablePicker()
      } else if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        if (isPicking && newShortcut.valid && onChange && typeof shortcutId !== 'undefined') {
          onChange(shortcutId, newShortcut.value)
        }

        disablePicker()
      } else {
        // Sadly, we can't rely on `event.code` to register the shortcut as there is no way (yet?) to map a
        // `KeyboardEvent.code` to a `KeyboardEvent.key`, specially as there is no way to determine the current keyboard
        // layout. There is a proposal (https://github.com/WICG/keyboard-map/blob/master/explainer.md) to add a new API
        // for this altho this seems pretty dead at the moment.
        setNewShortcut(getShortcutFromEvent(event))
      }

      event.preventDefault()
    }

    if (isPicking && picker.current) {
      picker.current.focus()
      window.addEventListener('keydown', onKeyDown)
    }

    return () => {
      if (isPicking) {
        window.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [isPicking, newShortcut, onChange, shortcutId])

  function enablePicker(): void {
    if (!readOnly) {
      setIsPicking(true)
    }
  }

  function disablePicker(): void {
    if (picker.current) {
      picker.current.blur()
    }

    setIsPicking(false)
    setNewShortcut(BlankNewShortcut)
  }

  function onBlurPicker(): void {
    disablePicker()
  }

  return (
    <Wrapper>
      <Picker disabled={readOnly} onFocus={enablePicker} ref={picker} onBlur={onBlurPicker}>
        {readOnly && <ReadOnlyIcon symbol={IconSymbol.LockFill} />}
        <div>
          {parsedShortcut.map((key, index) => (
            <Key key={`${key}-${index}`}>{formatKey(key)}</Key>
          ))}
        </div>
      </Picker>
      {isPicking ? (
        <div tw="italic">Press shortcut and then Enter</div>
      ) : (
        <div role={!readOnly ? 'button' : ''} onClick={!readOnly ? enablePicker : undefined}>
          {name}
        </div>
      )}
    </Wrapper>
  )
}

export default Shortcut

export interface ShortcutProps {
  shortcutId?: ShortcutId
  label: string
  onChange?: (shortcutId: ShortcutId, newShortcut: string) => void
  shortcut: string
}
