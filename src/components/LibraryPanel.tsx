import filesize from 'filesize'
import React from 'react'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import { getIpcRenderer } from '../main/ipc'
import type { HistoryEntry, HistorySelection } from '../store/history'
import { splitFilePath } from '../utils/string'
import Button from './Button'
import Icon, { IconSymbol } from './Icon'
import Img from './Img'

const transitionName = 'panelAnimation'

const Wrapper = styled.div`
  ${tw`absolute inset-y-0 right-0 border-solid border-l p-3 pb-4 text-sm`}

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

const Content = styled.div`
  ${tw`flex flex-col h-full px-2`}

  & > div:last-child {
    ${tw`flex-1 min-h-0 pt-6 text-center`}
  }
`

const CloseButton = styled(Button)`
  ${tw`rounded-full -mx-2`}

  font-size: 13px;
  height: 25px;
  width: 25px;

  &:hover {
    background-color: ${theme('color.black2')};
    color: ${theme('color.tint')};
  }
`

const FileName = tw.div`font-bold text-lg`

const Preview = styled(Img)`
  ${tw`border-4 border-solid self-stretch max-w-full max-h-full inline-block`}

  border-color: ${theme('library.panel.preview.border')};
  outline: 2px solid ${theme('library.panel.preview.outline')};
`

const Buttons = styled.div`
  ${tw`flex flex-wrap justify-center mt-4 mb-1`}

  & > button {
    ${tw`flex-1`}
  }
`

const LibraryPanel: React.FC<Props> = ({ selectEntry, selection }) => {
  const nodeRef = React.useRef(null)
  const visible = typeof selection.current !== 'undefined'
  const entry = visible ? selection.current : selection.previous

  return (
    <CSSTransition unmountOnExit nodeRef={nodeRef} in={visible} timeout={2000} classNames={transitionName}>
      <Wrapper ref={nodeRef}>{entry && <Panel entry={entry} selectEntry={selectEntry} />}</Wrapper>
    </CSSTransition>
  )
}

export default LibraryPanel

const Panel: React.FC<PanelProps> = ({ entry, selectEntry }) => {
  const [parentPath, filename] = splitFilePath(entry.path)
  const destination = getDestination(entry.destinationId)

  function onClickCloseButton(): void {
    selectEntry(undefined)
  }

  function openUrl(): Promise<void> {
    return getIpcRenderer().invoke('openUrl', entry.link)
  }

  return (
    <Content>
      <div>
        <CloseButton onClick={onClickCloseButton}>
          <Icon symbol={IconSymbol.XMark} />
        </CloseButton>
      </div>
      <Buttons>
        <PanelButton label="Open URL" symbol={IconSymbol.Link} onClick={openUrl} />
        <PanelButton label="Copy URL" symbol={IconSymbol.Paperclip} />
        <PanelButton label="Open file" symbol={IconSymbol.Doc} />
        <PanelButton label="Copy path" symbol={IconSymbol.RectangleAndPaperclip} />
        <PanelButton label="Delete" symbol={IconSymbol.MinusCircle} />
      </Buttons>
      <FileName>{filename}</FileName>
      <Box title="Informations">
        <BoxEntry label="Shared on" value={destination.getConfiguration().name} />
        <BoxEntry label="Dimensions" value={`${entry.dimensions.width} x ${entry.dimensions.height}`} />
        <BoxEntry label="Size" value={filesize(entry.size, { round: 0 })} />
        <BoxEntry
          label="Created"
          value={`${entry.date.toLocaleDateString()} at ${entry.date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`}
        />
        <BoxEntry label="Path" value={parentPath} />
      </Box>
      <Box>
        <Preview src={`file://${entry.path}`} />
      </Box>
    </Content>
  )
}

const BoxWrapper = styled.div`
  ${tw`border-t border-solid mt-3 mb-1 pt-3`}

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

const BoxEntry: React.FC<BoxEntryProps> = ({ label, value }) => {
  return (
    <BoxEntryWrapper>
      <BoxEntryLabel>{label}</BoxEntryLabel>
      <div css={tw`flex-1 mx-3`} />
      <div css={tw`truncate`}>{value}</div>
    </BoxEntryWrapper>
  )
}

const StyledButton = styled(Button)`
  ${tw`mb-5 mx-2`}

  color: ${theme('library.panel.button.color')};
  font-size: 13px;

  &:hover:not(:disabled) {
    color: ${theme('library.panel.button.hover.color')};
  }

  & > span {
    font-size: 22px;
  }
`

const PanelButton: React.FC<PanelButtonProps> = ({ label, symbol, ...restProps }) => {
  return (
    <StyledButton {...restProps}>
      <Icon symbol={symbol} />
      <div css={tw`mt-2`}>{label}</div>
    </StyledButton>
  )
}

interface Props {
  selectEntry: (entry: Optional<HistoryEntry>) => void
  selection: HistorySelection
}

interface PanelProps {
  entry: HistoryEntry
  selectEntry: (entry: Optional<HistoryEntry>) => void
}

interface BoxProps {
  title?: string
}

interface BoxEntryProps {
  label: string
  value: string | number
}

interface PanelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  symbol: IconSymbol
  label: string
}
