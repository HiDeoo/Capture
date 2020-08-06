import React from 'react'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import type { HistoryEntry, HistorySelection } from '../store/history'
import Button from './Button'
import Icon, { IconSymbol } from './Icon'
import Img from './Img'

const transitionName = 'panelAnimation'

const Wrapper = styled.div`
  ${tw`absolute inset-y-0 right-0 border-solid border-l p-3`}

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

  height: 27px;
  width: 27px;

  &:hover {
    background-color: ${theme('color.black2')};
    color: ${theme('color.tint')};
  }
`

const PreviewWrapper = tw.div`flex justify-center`

const Preview = styled(Img)`
  ${tw`border-4 border-solid my-3`}

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

  return (
    <CSSTransition unmountOnExit nodeRef={nodeRef} in={visible} timeout={2000} classNames={transitionName}>
      <Wrapper ref={nodeRef}>
        {entry && (
          <>
            <CloseButton onClick={onClickCloseButton}>
              <Icon symbol={IconSymbol.XMark} />
            </CloseButton>
            <PreviewWrapper>
              <Preview src={`file://${entry.path}`} />
            </PreviewWrapper>
          </>
        )}
      </Wrapper>
    </CSSTransition>
  )
}

export default LibraryPanel

interface Props {
  selectEntry: (entry: Optional<HistoryEntry>) => void
  selection: HistorySelection
}
