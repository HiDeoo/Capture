import { observer } from 'mobx-react-lite'
import React from 'react'

import { useSettings } from '../store'
import type { ImgurSettings } from '../destinations/imgur'

/**
 * Library Component.
 */
const Library: React.FC<{}> = () => {
  const { getDestinationSettings, setDestinationSetting } = useSettings()

  // TODO Remove
  const t = getDestinationSettings<ImgurSettings>('imgur')

  // TODO Remove
  function updateSetting(): void {
    setDestinationSetting<ImgurSettings>('imgur', 'test', new Date().toString())
  }

  return (
    <div>
      Library
      <button onClick={updateSetting}>Update destination setting</button>
      <div>{JSON.stringify(t)}</div>
    </div>
  )
}

export default observer(Library)
