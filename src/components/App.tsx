import React from 'react'

import Editor from './Editor'
import Library from './Library'
import { WindowType } from '../main/windows'

/**
 * App Component.
 */
const App: React.FC<Props> = (props) => {
  return props.windowType === WindowType.Library ? <Library /> : <Editor />
}

export default App

/**
 * React Props.
 */
interface Props {
  windowType: WindowType
}
