import 'styled-components/macro'

import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import tw from 'tailwind.macro'

import { useHistory } from '../store'
import LibraryGrid from './LibraryGrid'
import LibraryPanel from './LibraryPanel'

const Wrapper = tw.div`flex flex-1 relative`

const Library: React.FC = () => {
  const { entries, markAsDeletedOnDisk, selectEntry, selection } = useHistory()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        if (selection.current) {
          selectEntry()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  })

  return (
    <Wrapper>
      <LibraryGrid
        ids={entries.allIds}
        selectEntry={selectEntry}
        selectedEntryId={selection.current?.id}
        markAsDeletedOnDisk={markAsDeletedOnDisk}
      />
      <LibraryPanel selection={selection} selectEntry={selectEntry} />
    </Wrapper>
  )
}

export default observer(Library)
