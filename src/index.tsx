import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/App'
import { getWindowTypeFromUri } from './main/windows'

import { initStore } from './store'

// Grab the window type from the URI.
const windowType = getWindowTypeFromUri(window.location)

// Init the store.
initStore()

// Render the application.
ReactDOM.render(
  <React.StrictMode>
    <App windowType={windowType} />
  </React.StrictMode>,
  document.getElementById('root')
)
