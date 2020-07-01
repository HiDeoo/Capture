import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import Editor from './Editor'
import Library from './Library'
import { getIpcRenderer, IpcRendererEvent } from '../main/ipc'
import { useApp } from '../store'
import TitleBar from './TitleBar'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  ${tw`h-screen w-screen text-white`}

  background-color: #1b1a1e;
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
    <Wrapper>
      <TitleBar />
      {shouldShowEditor ? <Editor /> : <Library />}
    </Wrapper>
  )
}

export default observer(App)
