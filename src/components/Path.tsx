import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import { getPathComponents } from '../utils/string'
import Icon, { IconSymbol } from './Icon'

const Wrapper = styled.span`
  ${tw`block truncate text-left`}

  direction: rtl;
`

const Separator = styled(Icon)`
  ${tw`text-xs`}

  margin-left: 0.35rem;
  margin-right: 0.35rem;
`

const Path: React.FC<PathProps> = ({ value, ...restProps }) => {
  const components = getPathComponents(value)

  return (
    <Wrapper {...restProps}>
      {components.map((component, index) => (
        <React.Fragment key={`${index}-${component}`}>
          <span>{component}</span>
          {index < components.length - 1 && <Separator symbol={IconSymbol.ChevronRight} />}
        </React.Fragment>
      ))}
    </Wrapper>
  )
}

export default Path

export interface PathProps {
  value: string
}
