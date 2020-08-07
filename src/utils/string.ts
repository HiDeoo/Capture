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

/**
 * Splits the path to a file by separating the parent path and filename.
 * @param  path - The path to split.
 * @return The parent path and filename.
 */
export function splitFilePath(path: string): [string, string] {
  const matches = /^(?<parentPath>.*[\\/])(?<filename>.*)$/.exec(path)

  if (!matches || !matches.groups) {
    throw new Error('Unable to split file path.')
  }

  let parentPath = matches.groups.parentPath
  const filename = matches.groups.filename

  if (parentPath.length > 1 && parentPath.endsWith('/')) {
    parentPath = parentPath.substr(0, parentPath.length - 1)
  }

  return [parentPath, filename]
}
