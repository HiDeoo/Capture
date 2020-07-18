/**
 * Pluralizes if necessary a word based on a count.
 * @param  count - The count to use while pluralizing.
 * @param  singular - The singular word.
 * @param  plural - The plural word.
 * @return The pluralized word.
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}
