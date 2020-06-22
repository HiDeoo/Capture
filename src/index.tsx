import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/App'
import { getWindowTypeFromUri } from './main/windows'

const windowType = getWindowTypeFromUri(window.location)

ReactDOM.render(
  <React.StrictMode>
    <App windowType={windowType} />
  </React.StrictMode>,
  document.getElementById('root')
)
