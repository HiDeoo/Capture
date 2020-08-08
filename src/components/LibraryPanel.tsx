import filesize from 'filesize'
import React from 'react'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import type { HistoryEntry, HistorySelection } from '../store/history'
import { splitFilePath } from '../utils/string'
import Button from './Button'
import Icon, { IconSymbol } from './Icon'
import Img from './Img'

const transitionName = 'panelAnimation'

const Wrapper = styled.div`
  ${tw`absolute inset-y-0 right-0 border-solid border-l p-3 text-sm`}

  background-color: ${theme('bar.background')};
  border-color: ${theme('bar.border')};
  width: 450px;

  &.${transitionName}-enter {
    transform: translateX(100%);
  }

  &.${transitionName}-enter-active {
    transform: translateX(0%);
    transition: transform 350ms cubic-bezier(0.33, 1, 0.68, 1);
  }

  &.${transitionName}-exit {
    transform: translateX(0%);
  }

  &.${transitionName}-exit-active {
    transform: translateX(100%);
    transition: transform 250ms cubic-bezier(0.32, 0, 0.67, 0);
  }
`

const CloseButton = styled(Button)`
  ${tw`rounded-full`}

  font-size: 13px;
  height: 25px;
  width: 25px;

  &:hover {
    background-color: ${theme('color.black2')};
    color: ${theme('color.tint')};
  }
`

const FileName = tw.div`font-bold text-lg mb-3`

const Preview = styled(Img)`
  ${tw`border-4 border-solid mt-3`}

  border-color: ${theme('library.panel.preview.border')};
  outline: 2px solid ${theme('library.panel.preview.outline')};
  max-height: 400px;
`

const LibraryPanel: React.FC<Props> = ({ selectEntry, selection }) => {
  const nodeRef = React.useRef(null)
  const visible = typeof selection.current !== 'undefined'
  const entry = visible ? selection.current : selection.previous

  function onClickCloseButton(): void {
    selectEntry(undefined)
  }

  function renderEntry(theEntry: HistoryEntry): React.ReactNode {
    const [parentPath, filename] = splitFilePath(theEntry.path)
    const destination = getDestination(theEntry.destinationId)

    return (
      <>
        <CloseButton onClick={onClickCloseButton}>
          <Icon symbol={IconSymbol.XMark} />
        </CloseButton>
        <div css={tw`px-2`}>
          <div css={tw`flex justify-center mb-5`}>
            <Preview src={`file://${theEntry.path}`} />
          </div>
          <FileName>{filename}</FileName>
          <Box title="Informations">
            <BoxEntry label="Shared on" value={destination.getConfiguration().name} />
            <BoxEntry label="Dimensions" value={`${theEntry.dimensions.width} x ${theEntry.dimensions.height}`} />
            <BoxEntry label="Size" value={filesize(theEntry.size, { round: 0 })} />
            <BoxEntry
              label="Created"
              value={`${theEntry.date.toLocaleDateString()} at ${theEntry.date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}`}
            />
            <BoxEntry label="Path" value={parentPath} />
          </Box>
        </div>
      </>
    )
  }

  return (
    <CSSTransition unmountOnExit nodeRef={nodeRef} in={visible} timeout={2000} classNames={transitionName}>
      <Wrapper ref={nodeRef}>{entry && renderEntry(entry)}</Wrapper>
    </CSSTransition>
  )
}

export default LibraryPanel

const BoxWrapper = styled.div`
  ${tw`border-t border-solid mt-3 mb-4 pt-3`}

  border-color: ${theme('library.panel.box.border')};
`

const BoxTitle = styled.div`
  ${tw`font-bold -mt-1 mb-2`}

  color: ${theme('library.panel.box.title')};
`

const Box: React.FC<BoxProps> = ({ children, title }) => {
  return (
    <BoxWrapper>
      {title && <BoxTitle>{title}</BoxTitle>}
      {children}
    </BoxWrapper>
  )
}

const BoxEntryWrapper = styled.div`
  ${tw`border-b border-solid flex`}

  border-color: ${theme('library.panel.entry.border')};
  font-size: 0.79rem;
  padding: 3px 0;

  &:last-of-type {
    ${tw`border-0`}
  }
`

const BoxEntryLabel = styled.div`
  color: ${theme('library.panel.entry.label')};
`

const BoxEntry: React.FC<BoxEntryProps> = ({ children, label, value }) => {
  return (
    <BoxEntryWrapper>
      <BoxEntryLabel>{label}</BoxEntryLabel>
      <div css={tw`flex-1 mx-3`} />
      <div css={tw`truncate`}>{value}</div>
    </BoxEntryWrapper>
  )
}

interface Props {
  selectEntry: (entry: Optional<HistoryEntry>) => void
  selection: HistorySelection
}

interface BoxProps {
  title?: string
}

interface BoxEntryProps {
  label: string
  value: string | number
}
