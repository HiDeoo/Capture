import React from 'react'

/**
 * Select Component.
 */
const Select: React.FC<Props> = ({ options, ...htmlProps }) => {
  const children = options.map((option) => {
    const optionProps: SelectOption = typeof option === 'object' ? option : { value: option }

    return <option {...optionProps} key={optionProps.value} children={optionProps.label || optionProps.value} />
  })

  return <select {...htmlProps}>{children}</select>
}

export default Select

/**
 * React Props.
 */
interface Props {
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  options: (string | SelectOption)[]
}

/**
 * An interface describing a Select option containing a label and a value.
 */
export interface SelectOption {
  label?: string
  value: string
}
