import React from 'react'

import Button from '../components/Button'
import { useSettings } from '../store'

/**
 * Configuration of the general settings panel.
 */
export const GeneralSettingConfiguration = {
  id: 'general',
  name: 'General',
} as const

const GeneralSettings: React.FC<{}> = () => {
  const { debugGeneralOption, setDebugGeneralOption } = useSettings()

  function updateSetting(): void {
    setDebugGeneralOption(`general - ${new Date().toString()}`)
  }

  return (
    <div>
      General settings
      <div>{debugGeneralOption}</div>
      <Button onClick={updateSetting}>Update general setting</Button>
    </div>
  )
}

export default GeneralSettings
