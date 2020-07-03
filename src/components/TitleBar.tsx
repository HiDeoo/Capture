import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Button from './Button'
import Icon, { IconSymbol } from './Icon'
import { getIpcRenderer } from '../main/ipc'
import { useApp } from '../store'

/**
 * The context use to access & update the title bar content from a nested component.
 */
const TitleBarContext = React.createContext<TitleBarContext>({ titleBarContent: null, setTitleBarContent: () => {} })

/**
 * A hook to access the title bar context.
 */
export const useTitleBar = (): TitleBarContext => React.useContext(TitleBarContext)

/**
 * TitleBar context provider component.
 */
export const TitleBarProvider: React.FC<{}> = ({ children }) => {
  const [titleBarContent, setTitleBarContent] = useState<React.ReactNode>(null)

  return <TitleBarContext.Provider value={{ titleBarContent, setTitleBarContent }}>{children}</TitleBarContext.Provider>
}

/**
 * Wrapper component.
 */
const Wrapper = styled.div<IsFocusedProps>`
  ${tw`flex flex-row items-center font-semibold`}

  background-color: ${ifProp('isFocused', theme('titleBar.background'), theme('titleBar.blurred.background'))};
  height: 52px;
  color: ${ifProp('isFocused', theme('titleBar.color'), theme('titleBar.blurred.color'))};
  -webkit-app-region: drag;
  -webkit-user-select: none;
`

/**
 * SideBar component.
 */
const SideBar = styled.div`
  ${tw`h-full flex items-center border-solid border-r`}

  background-color: ${theme('sideBar.background')};
  border-color: ${theme('sideBar.border')};
  width: ${theme('sideBar.width')};
`

/**
 * CloseButtonIcon component.
 */
const CloseButtonIcon = styled(Icon)`
  ${tw`hidden font-extrabold`}

  color: ${theme('titleBar.control.color')};
  font-size: 9px;
  height: ${theme('titleBar.control.size')};
  width: ${theme('titleBar.control.size')};
  -webkit-app-region: no-drag;
`

/**
 * CloseButton component.
 */
const CloseButton = styled(Button)<IsFocusedProps>`
  ${tw`flex justify-center items-center cursor-default rounded-full`}

  background-color: ${ifProp(
    'isFocused',
    theme('titleBar.control.background'),
    theme('titleBar.blurred.control.background')
  )};
  height: ${theme('titleBar.control.size')};
  margin-left: 19px;
  margin-right: 19px;
  width: ${theme('titleBar.control.size')};

  &:hover {
    ${CloseButtonIcon} {
      ${tw`block`}
    }
  }
`

/**
 * TitleBar Component.
 */
const TitleBar: React.FC<{}> = () => {
  const { isFocused } = useApp()
  const { titleBarContent } = useTitleBar()

  function onClickCloseButton(): Promise<void> {
    return getIpcRenderer().invoke('closeWindow')
  }

  return (
    <Wrapper isFocused={isFocused}>
      <SideBar>
        <CloseButton onClick={onClickCloseButton} isFocused={isFocused}>
          <CloseButtonIcon symbol={IconSymbol.XMark} />
        </CloseButton>
      </SideBar>
      <div css={tw`flex px-4 w-full h-full items-center`}>
        Capture
        <div css={tw`flex-1`} />
        {titleBarContent}
      </div>
    </Wrapper>
  )
}

export default observer(TitleBar)

/**
 * React Props.
 */
interface IsFocusedProps {
  isFocused: boolean
}

/**
 * Interface describing the shape of the title bar context.
 */
interface TitleBarContext {
  titleBarContent: React.ReactNode
  setTitleBarContent: (newContent: React.ReactNode) => void
}
