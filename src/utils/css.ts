/**
 * A regular expression represeting a CSS value and its unit.
 */
const cssValueWithUnit = /^-?(\d+|\d*\.\d+)[a-z]+$/

/**
 * Strips the unit from a CSS value.
 * @param  value - A CSS value with a unit.
 * @return The unitless value
 */
export function stripUnit(value: string): number {
  const matches = cssValueWithUnit.exec(value)

  if (matches) {
    return parseFloat(value)
  }

  throw new Error(`Could not strip unit from CSS value "${value}".`)
}
