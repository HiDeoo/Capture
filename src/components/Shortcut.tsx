import React, { useEffect, useRef, useState } from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import { formatKey, getShortcutFromEvent, NewShortcut, parseShortcut } from '../utils/keyboard'
import type { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'
import { Button } from './SettingsUi'

const Wrapper = styled.div`
  ${tw`flex items-center`}

  margin-bottom: 0.6rem;
`

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
    min-width: 170px;

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
      background-color: red;
    }
  }
`

const ReadOnlyIcon = tw(Icon)`block opacity-50`

const BlankNewShortcut: NewShortcut = { valid: false, value: '' }

const Shortcut: React.FC<Props> = ({ name, readOnly = false, shortcut }) => {
  const picker = useRef<HTMLButtonElement>(null)
  const [isPicking, setIsPicking] = useState(false)
  const [newShortcut, setNewShortcut] = useState<NewShortcut>(BlankNewShortcut)

  const parsedShortcut = parseShortcut(isPicking ? newShortcut.value : shortcut)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      // Some keys should not be usabled while picking a shortcut and should cancel the picking phase.
      if (event.code === 'Escape' || event.code === 'Tab') {
        if (picker.current) {
          picker.current.blur()
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
  }, [isPicking])

  function onFocusPicker(): void {
    setIsPicking(true)
  }

  function onBlurPicker(): void {
    disablePicker()
  }

  function disablePicker(): void {
    setIsPicking(false)
    setNewShortcut(BlankNewShortcut)
  }

  return (
    <Wrapper>
      <Picker disabled={readOnly} onFocus={onFocusPicker} ref={picker} onBlur={onBlurPicker}>
        {readOnly && <ReadOnlyIcon symbol={IconSymbol.LockFill} />}
        <div>
          {parsedShortcut.map((key, index) => (
            <Key key={`${key}-${index}`}>{formatKey(key)}</Key>
          ))}
        </div>
      </Picker>
      <div>{isPicking ? <span tw="italic">Press shortcut and then Enter</span> : name}</div>
    </Wrapper>
  )
}

export default Shortcut

interface Props {
  name: string
  readOnly?: boolean
  shortcut: string
}
