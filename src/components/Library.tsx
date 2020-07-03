import { observer } from 'mobx-react-lite'
import React from 'react'
import 'styled-components/macro'
import tw from 'tailwind.macro'

import Button from './Button'
import type { ImgurSettings } from '../destinations/imgur'
import { useSettings } from '../store'

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
    <div css={tw`px-3 py-2`}>
      Library
      <Button onClick={updateSetting}>Update destination setting</Button>
      <div>{JSON.stringify(t)}</div>
      <div>
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        test
        <br />
        end
      </div>
    </div>
  )
}

export default observer(Library)
