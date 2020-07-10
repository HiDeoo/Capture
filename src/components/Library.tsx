import 'styled-components/macro'

import { observer } from 'mobx-react-lite'
import React from 'react'
import tw from 'tailwind.macro'

import { useHistory } from '../store'
import HistoryGrid from './HistoryGrid'

const Library: React.FC<{}> = () => {
  const { entries } = useHistory()

  return (
    <div css={tw`p-3`}>
      <HistoryGrid entries={entries} />
    </div>
  )
}

export default observer(Library)
