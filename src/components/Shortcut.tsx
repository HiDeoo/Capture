import React from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import { formatKey, parseShortcut } from '../utils/keyboard'
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
    ${tw`mr-3 flex justify-end items-center px-2`}

    width: 170px;

    &:hover:not(:disabled) {
      & ${Key} {
        background-color: ${theme('settings.shortcut.hover.background')};
      }
    }

    &:disabled {
      ${tw`justify-between`}

      opacity: 0.9;
    }
  }
`

const ReadOnlyIcon = tw(Icon)`block opacity-50`

const Shortcut: React.FC<Props> = ({ name, readOnly = false, shortcut }) => {
  const parsedShortcut = parseShortcut(shortcut)

  return (
    <Wrapper>
      <Picker disabled={readOnly}>
        {readOnly && <ReadOnlyIcon symbol={IconSymbol.LockFill} />}
        <div>
          {parsedShortcut.map((key, index) => (
            <Key key={`${key}-${index}`}>{formatKey(key)}</Key>
          ))}
        </div>
      </Picker>
      <div>{name}</div>
    </Wrapper>
  )
}

export default Shortcut

interface Props {
  name: string
  readOnly?: boolean
  shortcut: string
}
