import clsx from 'clsx'
import React from 'react'
import { ifProp } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import Button from './Button'

const Wrapper = tw.div`h-full flex flex-col items-center overflow-y-hidden`

export const SideBarButton = styled(Button)<SideBarButtonProps>`
  ${tw`mb-2 flex justify-center items-center`}

  cursor: ${ifProp('selected', 'default', 'pointer')};
`

const SideBar = <GenericEntry extends SideBarEntry>({
  entries,
  getEntryProps,
  onClick,
  ...restProps
}: React.PropsWithChildren<Props<GenericEntry>>): ReturnType<SideBarComponent<GenericEntry>> => {
  return (
    <Wrapper {...restProps}>
      {entries.map((entry, index) => {
        if (React.isValidElement(entry)) {
          return React.cloneElement(entry, { key: index })
        }

        const currentEntry = entry as GenericEntry
        const { content, disabled = false, selected = false } = getEntryProps(currentEntry)

        return (
          <SideBarButton
            disabled={disabled}
            selected={selected}
            key={currentEntry.id}
            className={clsx({ selected })}
            onClick={() => {
              onClick(currentEntry)
            }}
          >
            {content}
          </SideBarButton>
        )
      })}
    </Wrapper>
  )
}

export default SideBar

interface Props<GenericEntry extends SideBarEntry> {
  entries: (GenericEntry | React.ReactNode)[]
  getEntryProps: (entry: GenericEntry) => SideBarEntryProps
  onClick: (entry: GenericEntry) => void
}

export interface SideBarEntryProps {
  content: React.ReactNode
  disabled?: boolean
  selected?: boolean
}

interface SideBarButtonProps {
  selected: boolean
}

export interface SideBarEntry {
  id: string
}

/**
 * Exported type of the component so caller styling it using styled-components can still get proper type inference.
 * @see https://github.com/styled-components/styled-components/issues/1803
 */
export type SideBarComponent<GenericEntry extends SideBarEntry> = React.FC<Props<GenericEntry>>
