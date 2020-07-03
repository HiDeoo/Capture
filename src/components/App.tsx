import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Editor from './Editor'
import GlobalStyle from './GlobalStyle'
import Library from './Library'
import { getIpcRenderer, IpcRendererEvent } from '../main/ipc'
import SideBar from './SideBar'
import { useApp } from '../store'
import Theme from '../utils/theme'
import TitleBar, { TitleBarProvider } from './TitleBar'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  ${tw`flex flex-col h-full text-white overflow-y-hidden`}

  background-color: ${theme('window.background')};
`

/**
 * Main component.
 */
const Main = styled.div`
  ${tw`flex-1 flex h-full overflow-y-hidden`}
`

/**
 * Content component.
 */
const Content = styled.div<ContentProps>`
  ${tw`h-full flex-1 border-solid border-t overflow-y-auto p-4`}

  border-color: ${ifProp('isFocused', theme('titleBar.border'), theme('titleBar.blurred.border'))};
`

/**
 * App Component.
 */
const App: React.FC<{}> = (props) => {
  const ipcRenderer = getIpcRenderer()
  const { isFocused, pushToQueue, setWindowFocus, shouldShowEditor } = useApp()

  useEffect(() => {
    function onNewScreenshot(event: IpcRendererEvent, filePath: string): void {
      pushToQueue(filePath)
    }

    function onWindowBlur(): void {
      setWindowFocus(false)
    }

    function onWindowFocus(): void {
      setWindowFocus(true)
    }

    ipcRenderer.on('newScreenshot', onNewScreenshot)
    ipcRenderer.on('windowBlur', onWindowBlur)
    ipcRenderer.on('windowFocus', onWindowFocus)

    return () => {
      ipcRenderer.removeListener('newScreenshot', onNewScreenshot)
      ipcRenderer.removeListener('windowBlur', onWindowBlur)
      ipcRenderer.removeListener('windowFocus', onWindowFocus)
    }
  })

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={Theme}>
        <Wrapper>
          <TitleBarProvider>
            <TitleBar />
            <Main>
              <SideBar />
              <Content isFocused={isFocused}>{shouldShowEditor ? <Editor /> : <Library />}</Content>
            </Main>
          </TitleBarProvider>
        </Wrapper>
      </ThemeProvider>
    </>
  )
}

export default observer(App)

/**
 * React Props.
 */
interface ContentProps {
  isFocused: boolean
}
