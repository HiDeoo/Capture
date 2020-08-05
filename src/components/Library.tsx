import 'styled-components/macro'

import { observer } from 'mobx-react-lite'
import React from 'react'
import tw from 'tailwind.macro'

import { useHistory } from '../store'
import LibraryGrid from './LibraryGrid'

const Library: React.FC<{}> = () => {
  const { entries } = useHistory()

  return (
    <div css={tw`flex flex-1`}>
      <LibraryGrid entries={entries} />
    </div>
  )
}

export default observer(Library)
