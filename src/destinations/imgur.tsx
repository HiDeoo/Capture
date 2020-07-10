import React from 'react'

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
    return ({ getSettings, setSettings, Ui }) => {
      const settings = getSettings<ImgurSettings>()

      function updateSetting(): void {
        setSettings<ImgurSettings>('test', `imgur - ${new Date().toString()}`)
      }

      // TODO Clean UI so only passed down UI is used.
      return (
        <div>
          Imgur settings - {JSON.stringify(settings)}
          <div>{settings.test}</div>
          <Ui.Button onClick={updateSetting}>Update destination setting</Ui.Button>
        </div>
      )
    }
  }
}

export default new Imgur()

export interface ImgurSettings extends DestinationSettings {
  test: string
}
