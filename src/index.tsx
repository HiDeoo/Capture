// Even tho `_types` looks unused, it is used to provide TS typings for the `css` prop through styled-components.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as _types from 'styled-components/cssprop'

import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/App'
import { initStore } from './store'

import './styles.css'

// Init the store.
initStore()

// Render the application.
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
