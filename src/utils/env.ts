/**
 * Check if the application is running in development mode.
 * @return `true` in development mode.
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}
