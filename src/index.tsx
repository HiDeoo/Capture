// Even tho `_types` looks unused, it is used to provide TS typings for the `css` prop through styled-components.
// eslint-disable-next-line
import * as _types from 'styled-components/cssprop'

import './styles.css'

import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/App'
import { initStore } from './store'

// Init the store.
initStore()

// Render the application.
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
