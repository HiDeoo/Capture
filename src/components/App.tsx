import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import { getIpcRenderer, IpcRendererEvent } from '../main/ipc'
import { useApp, useSettings } from '../store'
import { Panel } from '../store/app'
import Theme from '../utils/theme'
import AppSideBar from './AppSideBar'
import Editor from './Editor'
import GlobalStyle from './GlobalStyle'
import Library from './Library'
import Settings from './Settings'
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

const Content = tw.div`h-full flex-1 overflow-y-auto flex flex-col`

const App: React.FC = () => {
  const ipcRenderer = getIpcRenderer()
  const { getDestinationSettingsSetter } = useSettings()
  const { currentPanel, pushToQueue, setWindowFocus } = useApp()

  useEffect(() => {
    function onOAuthRequest(
      event: IpcRendererEvent,
      destinationId: string,
      queryString: ParsedQueryString,
      hash: Optional<ParsedQueryString>
    ): void {
      // TODO Ensure settings and proper settings panel are visible.

      const destination = getDestination(destinationId)

      if (destination.onOAuthRequest) {
        destination.onOAuthRequest(getDestinationSettingsSetter(destinationId), queryString, hash)
      }
    }

    function onNewScreenshot(event: IpcRendererEvent, path: string): void {
      pushToQueue(path)
    }

    function onWindowBlur(): void {
      setWindowFocus(false)
    }

    function onWindowFocus(): void {
      setWindowFocus(true)
    }

    ipcRenderer.on('newOAuthRequest', onOAuthRequest)
    ipcRenderer.on('newScreenshot', onNewScreenshot)
    ipcRenderer.on('windowBlur', onWindowBlur)
    ipcRenderer.on('windowFocus', onWindowFocus)

    return () => {
      ipcRenderer.removeListener('newOAuthRequest', onOAuthRequest)
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
              <Content>{AppPanelMap[currentPanel]}</Content>
            </Main>
          </TitleBarProvider>
        </Wrapper>
      </ThemeProvider>
    </>
  )
}

export default observer(App)
