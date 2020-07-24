import { useEffect, useRef } from 'react'

/**
 * Caches previous props or state using a reference.
 * @param  value - The values to cache.
 * @return The previous values.
 */
export function usePrevious<T extends {}>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  })

  return ref.current
}
