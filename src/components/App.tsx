import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components/macro'
import { ifProp, theme } from 'styled-tools'
import tw from 'tailwind.macro'

import AppSideBar from './AppSideBar'
import Editor from './Editor'
import GlobalStyle from './GlobalStyle'
import Library from './Library'
import { getIpcRenderer, IpcRendererEvent } from '../main/ipc'
import Settings from './Settings'
import { useApp } from '../store'
import { Panel } from '../store/app'
import Theme from '../utils/theme'
import TitleBar, { TitleBarProvider } from './TitleBar'

/**
 * Application panel-to-component mapping.
 */
const AppPanelMap = {
  [Panel.Library]: <Library />,
  [Panel.Editor]: <Editor />,
  [Panel.Settings]: <Settings />,
} as const

const Wrapper = styled.div`
  ${tw`flex flex-col h-full text-white overflow-y-hidden select-none`}

  background-color: ${theme('window.background')};
`

const Main = styled.div`
  ${tw`flex-1 flex h-full overflow-y-hidden`}
`

const Content = styled.div<ContentProps>`
  ${tw`h-full flex-1 border-solid border-t overflow-y-auto flex flex-col`}

  border-color: ${ifProp('isFocused', theme('titleBar.border'), theme('titleBar.blurred.border'))};
`

const App: React.FC<{}> = (props) => {
  const ipcRenderer = getIpcRenderer()
  const { isFocused, panel, pushToQueue, setWindowFocus } = useApp()

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
              <AppSideBar />
              <Content isFocused={isFocused}>{AppPanelMap[panel]}</Content>
            </Main>
          </TitleBarProvider>
        </Wrapper>
      </ThemeProvider>
    </>
  )
}

export default observer(App)

interface ContentProps {
  isFocused: boolean
}
