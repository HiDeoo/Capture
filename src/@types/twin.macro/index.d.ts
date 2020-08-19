import 'twin.macro'

import styledComponent, { css as CSSProperty, CSSProp } from 'styled-components'

declare module 'twin.macro' {
  const css: typeof CSSProperty
  const styled: typeof styledComponent
}

declare module 'react' {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    css?: CSSProp
  }
}

interface SVGProps<T> extends SVGAttributes<T> {
  css?: CSSProp
}
