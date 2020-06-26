import { observer } from 'mobx-react-lite'
import React from 'react'

import { useSettings } from '../store'

/**
 * Library Component.
 */
const Library: React.FC<{}> = () => {
  const { bumpTest1, test1 } = useSettings()

  return (
    <div>
      Library
      <button onClick={bumpTest1}>Bump</button>
      <div>{test1}</div>
    </div>
  )
}

export default observer(Library)
