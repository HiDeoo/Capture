import 'tailwindcss/dist/base.min.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components/macro'

import App from './components/App'
import ErrorBoundary from './components/ErrorBoundary'
import GlobalStyle from './components/GlobalStyle'
import { initStore } from './store'
import Theme from './utils/theme'

// Init the store.
initStore()

// Render the application.
ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <ThemeProvider theme={Theme}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
