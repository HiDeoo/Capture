import { observer } from 'mobx-react-lite'
import React from 'react'
import tw from 'twin.macro'

import { useHistory } from '../store'
import { useShortcut } from '../utils/keyboard'
import LibraryGrid from './LibraryGrid'
import LibraryNis from './LibraryNis'
import LibraryPanel from './LibraryPanel'

const Wrapper = tw.div`flex flex-1 relative`

const Library: React.FC = () => {
  const { entries, markAsDeletedOnDisk, selectEntry, selection } = useHistory()

  useShortcut({
    Escape: () => {
      if (selection.current) {
        selectEntry()
      }
    },
  })

  return (
    <Wrapper>
      {entries.allIds.length > 0 ? (
        <>
          <LibraryGrid
            ids={entries.allIds}
            selectEntry={selectEntry}
            selectedEntryId={selection.current?.id}
            markAsDeletedOnDisk={markAsDeletedOnDisk}
          />
          <LibraryPanel selection={selection} selectEntry={selectEntry} />
        </>
      ) : (
        <LibraryNis />
      )}
    </Wrapper>
  )
}

export default observer(Library)
