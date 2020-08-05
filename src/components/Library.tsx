import 'styled-components/macro'

import { observer } from 'mobx-react-lite'
import React from 'react'
import tw from 'tailwind.macro'

import { useHistory } from '../store'
import LibraryGrid from './LibraryGrid'
import LibraryPanel from './LibraryPanel'

const Wrapper = tw.div`flex flex-1 relative`

const Library: React.FC<{}> = () => {
  const { clearSelectedEntry, entries, hasSelectedEntry, selectedEntry, selectEntry } = useHistory()

  return (
    <Wrapper>
      <LibraryGrid
        entries={entries}
        selectEntry={selectEntry}
        selectedEntry={selectedEntry}
        hasSelectedEntry={hasSelectedEntry}
        clearSelectedEntry={clearSelectedEntry}
      />
      <LibraryPanel entry={selectedEntry} visible={hasSelectedEntry} />
    </Wrapper>
  )
}

export default observer(Library)
