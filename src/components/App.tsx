import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Editor from './Editor'
import Library from './Library'
import { getIpcRenderer, IpcRendererEvent } from '../main/ipc'
import { useApp } from '../store'
import Theme from '../utils/theme'
import TitleBar from './TitleBar'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  ${tw`h-screen w-screen text-white`}

  background-color: ${theme('window.background')};
`

/**
 * App Component.
 */
const App: React.FC<{}> = (props) => {
  const { pushToQueue, setWindowFocus, shouldShowEditor } = useApp()

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

    getIpcRenderer().on('newScreenshot', onNewScreenshot)
    getIpcRenderer().on('windowBlur', onWindowBlur)
    getIpcRenderer().on('windowFocus', onWindowFocus)

    return () => {
      getIpcRenderer().removeListener('newScreenshot', onNewScreenshot)
      getIpcRenderer().removeListener('windowBlur', onWindowBlur)
      getIpcRenderer().removeListener('windowFocus', onWindowFocus)
    }
  })

  return (
    <ThemeProvider theme={Theme}>
      <Wrapper>
        <TitleBar />
        {shouldShowEditor ? <Editor /> : <Library />}
      </Wrapper>
    </ThemeProvider>
  )
}

export default observer(App)
