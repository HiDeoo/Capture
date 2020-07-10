import { observer } from 'mobx-react-lite'
import React from 'react'
import 'styled-components/macro'
import tw from 'tailwind.macro'

import HistoryGrid from './HistoryGrid'
import { useHistory } from '../store'

const Library: React.FC<{}> = () => {
  const { entries } = useHistory()

  return (
    <div css={tw`p-3`}>
      <HistoryGrid entries={entries} />
    </div>
  )
}

export default observer(Library)
