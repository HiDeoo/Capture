import React from 'react'

import Button from '../components/Button'
import type { SettingsPanelProps } from '../components/SettingsPanel'
import Destination, { DestinationConfiguration, DestinationSettings } from '../utils/Destination'

/**
 * Imgur destination.
 */
class Imgur implements Destination {
  /**
   * Returns the destination configuration.
   * @return The configuration.
   */
  getConfiguration(): DestinationConfiguration {
    return {
      id: 'imgur',
      name: 'Imgur',
    }
  }

  /**
   * Returns the destination default settings.
   * @return The default settings.
   */
  getDefaultSettings(): ImgurSettings {
    return {
      test: 'test1',
    }
  }

  /**
   * Share a file to Imgur.
   * @param filePath - The path of the file to share.
   */
  async share(filePath: string): Promise<void> {
    console.log('filePath ', filePath)

    // TODO Add implementation

    return Promise.resolve()
  }

  /**
   * Returns the destination settings panel.
   * @return The settings panel.
   */
  getSettingsPanel(): React.FC<SettingsPanelProps> {
    return ({ getSettings, setSettings }) => {
      const settings = getSettings<ImgurSettings>()

      function updateSetting(): void {
        setSettings<ImgurSettings>('test', `imgur - ${new Date().toString()}`)
      }

      return (
        <div>
          Imgur settings - {JSON.stringify(settings)}
          <div>{settings.test}</div>
          {/* // TODO Pass down UI element */}
          <Button onClick={updateSetting}>Update destination setting</Button>
        </div>
      )
    }
  }
}

export default new Imgur()

export interface ImgurSettings extends DestinationSettings {
  test: string
}
