import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import { getIpcRenderer, IpcRendererEvent } from '../main/ipc'
import { useApp, useHistory, useSettings } from '../store'
import { Panel } from '../store/app'
import AppSideBar from './AppSideBar'
import Editor from './Editor'
import ErrorBoundary, { MainProcessError, useErrorHandler } from './ErrorBoundary'
import Library from './Library'
import Settings from './Settings'
import TitleBar, { TitleBarProvider } from './TitleBar'

/**
 * Application panel-to-component mapping.
 */
const AppPanelMap = {
  [Panel.Library]: <Library />,
  [Panel.Editor]: (
    <ErrorBoundary primaryButtonLabel="Ok" primaryButtonHandler={onEditorError}>
      <Editor />
    </ErrorBoundary>
  ),
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

  const { selectEntry } = useHistory()
  const handlerError = useErrorHandler()
  const { getDestinationSettingsSetter } = useSettings()
  const { currentPanel, pushToQueue, setWindowFocus } = useApp()

  useEffect(() => {
    function onNewError(event: IpcRendererEvent, message: string, internalError?: string): void {
      handlerError(new MainProcessError(message, internalError))
    }

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

    function onNewScreenshot(event: IpcRendererEvent, path: string, size: number): void {
      selectEntry()
      pushToQueue(path, size)
    }

    function onWindowBlur(): void {
      setWindowFocus(false)
    }

    function onWindowFocus(): void {
      setWindowFocus(true)
    }

    ipcRenderer.on('newError', onNewError)
    ipcRenderer.on('newOAuthRequest', onOAuthRequest)
    ipcRenderer.on('newScreenshot', onNewScreenshot)
    ipcRenderer.on('windowBlur', onWindowBlur)
    ipcRenderer.on('windowFocus', onWindowFocus)

    return () => {
      ipcRenderer.removeListener('newError', onNewError)
      ipcRenderer.removeListener('newOAuthRequest', onOAuthRequest)
      ipcRenderer.removeListener('newScreenshot', onNewScreenshot)
      ipcRenderer.removeListener('windowBlur', onWindowBlur)
      ipcRenderer.removeListener('windowFocus', onWindowFocus)
    }
  })

  return (
    <Wrapper>
      <TitleBarProvider>
        <TitleBar />
        <Main>
          <AppSideBar />
          <Content>{AppPanelMap[currentPanel]}</Content>
        </Main>
      </TitleBarProvider>
    </Wrapper>
  )
}

export default observer(App)

function onEditorError(resetErrorBoundary: () => void): void {
  resetErrorBoundary()
}
