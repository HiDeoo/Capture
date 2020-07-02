import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  ${tw`h-full flex justify-center overflow-y-hidden border-solid border-r pt-1 font-bold`}

  background-color: ${theme('sideBar.background')};
  border-color: ${theme('sideBar.border')};
  color: ${theme('sideBar.color')};
  width: ${theme('sideBar.width')};
`

/**
 * SideBar Component.
 */
const SideBar: React.FC<{}> = () => {
  return <Wrapper>S</Wrapper>
}

export default SideBar
