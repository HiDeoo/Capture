import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import { useSettings } from '../store'
import type { ImgurSettings } from '../destinations/imgur'

/**
 * Test component.
 */
const Test = styled.div`
  background-color: red;

  ${tw`bg-purple-600`}
`

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
      <Test>test</Test>
    </div>
  )
}

export default observer(Library)
