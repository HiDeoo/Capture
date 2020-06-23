import React from 'react'

import { getIpcRenderer } from '../main/ipc'
import { WindowType } from '../main/windows'

// TODO Remove
getIpcRenderer().on('newScreenshot', (_, path: string) => {
  console.log('path', path)
})

/**
 * App Component.
 */
const App: React.FC<Props> = (props) => {
  return <div>Hello {props.windowType}</div>
}

export default App

/**
 * React Props.
 */
interface Props {
  windowType: WindowType
}
