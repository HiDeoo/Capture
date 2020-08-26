import React, { useEffect, useRef } from 'react'

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

/**
 * Creates a React Portal.
 * @param  id - The portal root element ID.
 * @return The portal container to use with `React.createPortal(children, container)`.
 */
export function usePortal(id: string): HTMLDivElement {
  const container = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const currentRootElement = document.querySelector(`#${id}`)
    const rootElement = currentRootElement ?? createDivElementWithId(id)

    if (!currentRootElement && document.body.lastElementChild) {
      document.body.insertBefore(rootElement, document.body.lastElementChild.nextElementSibling)
    }

    if (container.current) {
      rootElement.appendChild(container.current)
    }

    return () => {
      if (container.current) {
        container.current.remove()
      }

      if (rootElement.childNodes.length === 0) {
        rootElement.remove()
      }
    }
  }, [id])

  function getElement(): HTMLDivElement {
    if (!container.current) {
      container.current = document.createElement('div')
    }

    return container.current
  }

  return getElement()
}

/**
 * Creates a div element with a specific ID.
 * @param  id - The id of the div element.
 * @return The div element.
 */
function createDivElementWithId(id: string): HTMLDivElement {
  const parentElement = document.createElement('div')
  parentElement.setAttribute('id', id)

  return parentElement
}

/**
 * Triggers a callback when a click is detected outside of an element.
 * @param element - The element to monitor.
 * @param callback - The callback to trigger on click outside of the element.
 */
export function useOnClickOutside(element: React.RefObject<Element>, callback: () => void): void {
  useEffect(() => {
    const listener = (event: MouseEvent): void => {
      if (!element.current || (event.target instanceof Element && element.current.contains(event.target))) {
        return
      }

      callback()
    }

    document.addEventListener('mousedown', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
    }
  }, [element, callback])
}

/**
 * Wraps conditionally a component.
 * @param children - The content to conditionally wrap.
 * @param condition - The condition.
 * @param wrapper - A render prop used to wrap the component.
 */
export const Wrap: React.FC<WrapProps> = ({ children, condition, wrapper }) => {
  return condition ? wrapper(children) : children
}

interface WrapProps {
  children: React.ReactElement
  condition: boolean
  wrapper: (children: React.ReactElement) => React.ReactElement
}
