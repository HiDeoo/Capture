import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import { getDestination } from '../destinations'
import { getIpcRenderer, IpcRendererEvent } from '../main/ipc'
import { useApp, useHistory, useSettings } from '../store'
import { Panel } from '../store/app'
import { ShortcutId, useShortcut } from '../utils/keyboard'
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
    <ErrorBoundary>
      <Editor />
    </ErrorBoundary>
  ),
  [Panel.Settings]: <Settings />,
} as const

const Wrapper = styled.div`
  ${tw`flex flex-col h-full text-white overflow-y-hidden select-none`}

  background-color: ${theme('window.background')};
`

const Main = tw.div`flex-1 flex h-full overflow-y-hidden`
const Content = tw.div`h-full flex-1 overflow-y-auto flex flex-col`

const App: React.FC = () => {
  const ipcRenderer = getIpcRenderer()

  const { selectEntry } = useHistory()
  const handleError = useErrorHandler()
  const { currentPanel, pushToQueue, setCurrentPanel, setCurrentSettingsPanel, setWindowFocus } = useApp()
  const {
    getDestinationSettingsSetter,
    playScreenCaptureSounds,
    screenshotDirectory,
    setOpenAtLogin,
    setScreenshotDirectory,
    shortcuts,
  } = useSettings()

  const captureScreenshotShortcut = shortcuts[ShortcutId.CaptureScreenshot]

  useEffect(() => {
    function onNewError(event: IpcRendererEvent, message: string, internalError?: string): void {
      handleError(new MainProcessError(message, internalError))
    }

    function onOAuthRequest(
      event: IpcRendererEvent,
      destinationId: string,
      queryString: ParsedQueryString,
      hash: Optional<ParsedQueryString>
    ): void {
      const destination = getDestination(destinationId)

      setCurrentPanel(Panel.Settings)
      setCurrentSettingsPanel(destinationId)

      if (destination.onOAuthRequest) {
        destination.onOAuthRequest(getDestinationSettingsSetter(destinationId), queryString, hash, handleError)
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

  useEffect(() => {
    async function getDefaultScreenshotDirectory(): Promise<void> {
      const defaultScreenshotDirectory = await getIpcRenderer().invoke('getDefaultScreenshotDirectory')

      setScreenshotDirectory(defaultScreenshotDirectory)
    }

    if (screenshotDirectory.length > 0) {
      void getIpcRenderer().invoke('newScreenshotDirectory', screenshotDirectory)
    } else {
      void getDefaultScreenshotDirectory()
    }
  }, [screenshotDirectory, setScreenshotDirectory])

  useEffect(() => {
    void getIpcRenderer().invoke('newCaptureScreenshotShortcut', captureScreenshotShortcut)
  }, [captureScreenshotShortcut])

  useEffect(() => {
    void getIpcRenderer().invoke('newScreenCaptureSounds', playScreenCaptureSounds)
  }, [playScreenCaptureSounds])

  useEffect(() => {
    async function getOpenAtLogin(): Promise<void> {
      const openAtLogin = await getIpcRenderer().invoke('getOpenAtLogin')

      setOpenAtLogin(openAtLogin)
    }

    void getOpenAtLogin()
  }, [setOpenAtLogin])

  useShortcut({ Comma: onCommaShortcut })

  function onCommaShortcut(event: KeyboardEvent): void {
    if (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && currentPanel !== Panel.Editor) {
      setCurrentPanel(Panel.Settings)
    }
  }

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
