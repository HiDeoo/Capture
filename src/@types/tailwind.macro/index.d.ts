declare module 'tailwind.macro' {
  import { StyledInterface } from 'styled-components'

  export interface TailwindInterface extends StyledInterface {
    <C extends AnyStyledComponent>(component: C): ThemedStyledFunction<
      StyledComponentInnerComponent<C>,
      T,
      StyledComponentInnerOtherProps<C>,
      StyledComponentInnerAttrs<C>
    >
    <C extends keyof JSX.IntrinsicElements | React.ComponentType<unknown>>(component: C): ThemedStyledFunction<C, T>
  }

  declare const tw: TailwindInterface

  export default tw
}
