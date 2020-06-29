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
