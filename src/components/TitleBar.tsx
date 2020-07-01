import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import Button from './Button'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  ${tw`border-solid border-b border-black flex flex-row items-center font-semibold`}

  background-color: #141314;
  height: 52px;
  -webkit-app-region: drag;
  -webkit-user-select: none;
`

/**
 * CloseButton component.
 */
const CloseButton = styled(Button)`
  ${tw`rounded-full cursor-default`}

  background-color: #ef4f47;
  height: 13px;
  margin-left: 19px;
  margin-right: 19px;
  width: 13px;
`

/**
 * TitleBar Component.
 */
const TitleBar: React.FC<{}> = () => {
  return (
    <Wrapper>
      <CloseButton />
      Capture
    </Wrapper>
  )
}

export default TitleBar
