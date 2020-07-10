import { createGlobalStyle } from 'styled-components/macro'

import Theme from '../utils/theme'

export default createGlobalStyle`
  html,
  body,
  body > div {
    background-color: ${Theme.window.background};
    height: 100vh;
  }
`
