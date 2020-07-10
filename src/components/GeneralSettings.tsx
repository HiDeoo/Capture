import React from 'react'

/**
 * Configuration of the general settings panel.
 */
export const GeneralSettingConfiguration = {
  id: 'general',
  name: 'General',
} as const

const GeneralSettings: React.FC<{}> = () => {
  return <div>General settings</div>
}

export default GeneralSettings
