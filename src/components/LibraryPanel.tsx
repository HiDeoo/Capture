import React from 'react'
import { CSSTransition } from 'react-transition-group'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import type { HistorySelection } from '../store/history'

const transitionName = 'panelAnimation'

const Wrapper = styled.div`
  ${tw`absolute inset-y-0 right-0 border-solid border-l`}

  background-color: ${theme('bar.background')};
  border-color: ${theme('bar.border')};
  width: 500px;

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

const LibraryPanel: React.FC<Props> = ({ selection }) => {
  const nodeRef = React.useRef(null)
  const visible = typeof selection.current !== 'undefined'
  const entry = visible ? selection.current : selection.previous

  return (
    <CSSTransition unmountOnExit nodeRef={nodeRef} in={visible} timeout={2000} classNames={transitionName}>
      <Wrapper ref={nodeRef}>{JSON.stringify(entry)}</Wrapper>
    </CSSTransition>
  )
}

export default LibraryPanel

interface Props {
  selection: HistorySelection
}
