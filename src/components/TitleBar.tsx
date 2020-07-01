import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import Button from './Button'
import { getIpcRenderer } from '../main/ipc'
import { useApp } from '../store'

/**
 * Wrapper component.
 */
const Wrapper = styled.div<AppIsFocusedProps>`
  ${tw`border-solid border-b flex flex-row items-center font-semibold`}

  background-color: ${(props) => (props.appIsFocused ? '#141314' : '#161516')};
  border-color: ${(props) => (props.appIsFocused ? '#000000' : '#080808')};
  height: 52px;
  color: ${(props) => (props.appIsFocused ? '#ffffff' : '#e3e3e3')};
  -webkit-app-region: drag;
  -webkit-user-select: none;
`

/**
 * CloseButton component.
 */
const CloseButton = styled(Button)<AppIsFocusedProps>`
  ${tw`rounded-full cursor-default`}

  background-color: ${(props) => (props.appIsFocused ? '#ef4f47' : '#3d3b3f')};
  height: 13px;
  margin-left: 19px;
  margin-right: 19px;
  width: 13px;

  &:hover {
    svg {
      display: block;
    }
  }

  svg {
    display: none;
    fill: #990001;
    height: 11px;
    margin-left: 1px;
    width: 11px;
  }
`

/**
 * TitleBar Component.
 */
const TitleBar: React.FC<{}> = () => {
  const { isFocused } = useApp()

  function onClickCloseButton(): Promise<void> {
    return getIpcRenderer().invoke('closeWindow')
  }

  return (
    <Wrapper appIsFocused={isFocused}>
      <CloseButton onClick={onClickCloseButton} appIsFocused={isFocused}>
        <svg focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
          <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
        </svg>
      </CloseButton>
      Capture
    </Wrapper>
  )
}

export default observer(TitleBar)

/**
 * React Props.
 */
interface AppIsFocusedProps {
  appIsFocused: boolean
}
