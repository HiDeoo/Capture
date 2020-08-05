import 'styled-components/macro'

import { observer } from 'mobx-react-lite'
import React from 'react'
import tw from 'tailwind.macro'

import { useHistory } from '../store'
import LibraryGrid from './LibraryGrid'
import LibraryPanel from './LibraryPanel'

const Wrapper = tw.div`flex flex-1 relative`

const Library: React.FC<{}> = () => {
  const { entries, selectedEntry, selectEntry } = useHistory()

  return (
    <Wrapper>
      <LibraryGrid entries={entries} selectEntry={selectEntry} selectedEntry={selectedEntry} />
      <LibraryPanel entry={selectedEntry} />
    </Wrapper>
  )
}

export default observer(Library)
