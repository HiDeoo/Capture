import 'styled-components/macro'

import { observer } from 'mobx-react-lite'
import React from 'react'
import tw from 'tailwind.macro'

import { useHistory } from '../store'
import LibraryGrid from './LibraryGrid'
import LibraryPanel from './LibraryPanel'

const Wrapper = tw.div`flex flex-1 relative`

const Library: React.FC<{}> = () => {
  const { entries, selectEntry, selection } = useHistory()

  return (
    <Wrapper>
      <LibraryGrid entries={entries} selectedEntryId={selection.current?.id} selectEntry={selectEntry} />
      <LibraryPanel selection={selection} />
    </Wrapper>
  )
}

export default observer(Library)
