import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import { HistoryEntry } from '../store/history'

const Wrapper = styled.div`
  ${tw`absolute inset-y-0 right-0 border-solid border-l`}

  background-color: ${theme('bar.background')};
  border-color: ${theme('bar.border')};
  width: 500px;
`

const LibraryPanel: React.FC<Props> = ({ entry }) => {
  if (!entry) {
    return null
  }

  return <Wrapper>{JSON.stringify(entry)}</Wrapper>
}

export default LibraryPanel

interface Props {
  entry?: HistoryEntry
}
