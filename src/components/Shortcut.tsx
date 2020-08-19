import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import type { ButtonProps } from './Button'
import Icon, { IconSymbol } from './Icon'
import { Button } from './SettingsUi'

const Wrapper = styled.div`
  ${tw`flex items-center mb-2`}
`

const Picker = styled(Button)<ButtonProps>`
  && {
    ${tw`w-40 mr-3 flex justify-end`}

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
  return (
    <Wrapper>
      <Picker disabled={readOnly}>
        {readOnly && <ReadOnlyIcon symbol={IconSymbol.LockFill} />}
        <div>{shortcut}</div>
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
