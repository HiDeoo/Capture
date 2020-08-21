import React from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import { getIpcRenderer } from '../main/ipc'
import { getPathComponents } from '../utils/string'
import Button from './Button'
import Icon, { IconSymbol } from './Icon'

const Wrapper = styled.span`
  ${tw`block truncate text-left ml-2`}

  direction: rtl;
`

const Separator = styled(Icon)`
  ${tw`text-xs`}

  margin-left: 0.35rem;
  margin-right: 0.35rem;
`

const RevealButton = styled(Button)`
  ${tw`ml-2`}

  &:hover:not(:disabled) {
    color: ${theme('settings.button.hover.color')};
  }
`

const Path: React.FC<PathProps> = ({ value, ...restProps }) => {
  const components = getPathComponents(value)

  function onClickReveal(): Promise<string> {
    return getIpcRenderer().invoke('openFile', value)
  }

  return (
    <div tw="flex">
      <Icon symbol={IconSymbol.Folder} />
      <Wrapper {...restProps}>
        {components.map((component, index) => (
          <React.Fragment key={`${index}-${component}`}>
            <span>{component}</span>
            {index < components.length - 1 && <Separator symbol={IconSymbol.ChevronRight} />}
          </React.Fragment>
        ))}
      </Wrapper>
      <RevealButton onClick={onClickReveal}>
        <Icon symbol={IconSymbol.ArrowRightCircle} />
      </RevealButton>
    </div>
  )
}

export default Path

export interface PathProps {
  value: string
}
