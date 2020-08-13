import filesize from 'filesize'
import React from 'react'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import { getIpcRenderer } from '../main/ipc'
import type { HistoryEntry, HistorySelection, SelectEntry } from '../store/history'
import { splitFilePath } from '../utils/string'
import Button from './Button'
import DeleteModal from './DeleteModal'
import Icon, { IconSymbol } from './Icon'
import Img from './Img'
import { useModal } from './Modal'

const transitionName = 'panelAnimation'
const transitionEnterDuration = 350
const transitionExitDuration = 250

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
    transition: transform ${transitionEnterDuration}ms ${theme('easing.easeOutCubic')};
  }

  &.${transitionName}-exit {
    transform: translateX(0%);
  }

  &.${transitionName}-exit-active {
    transform: translateX(100%);
    transition: transform ${transitionExitDuration}ms ${theme('easing.easeInCubic')};
  }
`

const Content = styled.div`
  ${tw`flex flex-col h-full px-2`}

  & > div.previewBox {
    ${tw`flex-1 min-h-0 pt-6 text-center`}
  }
`

const CloseButton = styled(Button)`
  ${tw`rounded-full -mx-2`}

  font-size: 13px;
  height: 25px;
  width: 25px;

  &:hover {
    background-color: ${theme('color.black3')};
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
    <CSSTransition
      in={visible}
      mountOnEnter
      unmountOnExit
      nodeRef={nodeRef}
      classNames={transitionName}
      timeout={visible ? transitionEnterDuration : transitionExitDuration}
    >
      <Wrapper ref={nodeRef}>{entry && <Panel entry={entry} selectEntry={selectEntry} />}</Wrapper>
    </CSSTransition>
  )
}

export default LibraryPanel

const Panel: React.FC<PanelProps> = ({ entry, selectEntry }) => {
  const { isModalOpened, openModal } = useModal()

  const [parentPath, filename] = splitFilePath(entry.path)
  const destination = getDestination(entry.destinationId)

  function onClickCloseButton(): void {
    selectEntry()
  }

  function openUrl(): Promise<void> {
    return getIpcRenderer().invoke('openUrl', entry.link)
  }

  function copyUrl(): Promise<void> {
    return getIpcRenderer().invoke('copyTextToClipboard', entry.link)
  }

  function openFile(): Promise<string> {
    return getIpcRenderer().invoke('openFile', entry.path)
  }

  function copyPath(): Promise<void> {
    return getIpcRenderer().invoke('copyTextToClipboard', entry.path)
  }

  function openDeleteModal(): void {
    openModal(true)
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
        <PanelButton label="Copy URL" symbol={IconSymbol.Paperclip} onClick={copyUrl} />
        <PanelButton label="Open file" symbol={IconSymbol.Doc} onClick={openFile} disabled={entry.deleted.disk} />
        <PanelButton
          label="Copy path"
          onClick={copyPath}
          disabled={entry.deleted.disk}
          symbol={IconSymbol.RectangleAndPaperclip}
        />
        <PanelButton
          label="Delete"
          onClick={openDeleteModal}
          symbol={IconSymbol.MinusCircle}
          disabled={entry.deleted.disk && entry.deleted.destination}
        />
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
        <BoxEntry label="Path" value={!entry.deleted.disk ? parentPath : 'Deleted from disk'} />
      </Box>
      <Box visible={!entry.deleted.disk} className="previewBox">
        <Preview src={`file://${entry.path}`} />
      </Box>
      <DeleteModal key={entry.id} opened={isModalOpened} open={openModal} entry={entry} />
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

const Box: React.FC<BoxProps> = ({ children, className, title, visible = true }) => {
  if (!visible) {
    return null
  }

  return (
    <BoxWrapper className={className}>
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

  &:disabled {
    color: ${theme('library.panel.button.disabled.color')};
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
  selectEntry: SelectEntry
  selection: HistorySelection
}

interface PanelProps {
  entry: HistoryEntry
  selectEntry: SelectEntry
}

interface BoxProps {
  className?: string
  title?: string
  visible?: boolean
}

interface BoxEntryProps {
  label: string
  value: string | number
}

interface PanelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  symbol: IconSymbol
  label: string
}
