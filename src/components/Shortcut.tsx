import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { parseShortcut } from '../utils/keyboard'
import type { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'
import { Button } from './SettingsUi'

const Wrapper = styled.div`
  ${tw`flex items-center`}

  margin-bottom: 0.6rem;
`

const Key = styled.span`
  ${tw`mx-1 py-1 px-3 inline-block rounded shadow text-xs font-semibold`}

  background-color: ${theme('settings.shortcut.background')};

  &:last-child {
    ${tw`mr-0`}
  }
`

const Picker = styled(Button)<ButtonProps>`
  && {
    ${tw`w-40 mr-3 flex justify-end items-center px-2`}

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

const ReadOnlyIcon = styled(Icon)`
  ${tw`block`}

  opacity: 0.5;
`

const Shortcut: React.FC<Props> = ({ name, readOnly = false, shortcut }) => {
  const parsedShortcut = parseShortcut(shortcut)

  return (
    <Wrapper>
      <Picker disabled={readOnly}>
        {readOnly && <ReadOnlyIcon symbol={IconSymbol.LockFill} />}
        <div>
          {parsedShortcut.map((key, index) => (
            <Key key={`${key}-${index}`}>{key}</Key>
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
