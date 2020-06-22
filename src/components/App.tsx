import React from 'react'

import { WindowType } from '../main/windows'

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
