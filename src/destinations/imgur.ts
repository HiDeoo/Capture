import Destination, { DestinationConfiguration, DestinationSettings } from '../libs/Destination'

/**
 * Imgur destination.
 */
class Imgur implements Destination {
  /**
   * Returns the destination configuration.
   */
  getConfiguration(): DestinationConfiguration {
    return {
      id: 'imgur',
      name: 'Imgur',
    }
  }

  /**
   * Returns the destination default settings.
   */
  getDefaultSettings(): ImgurSettings {
    return {
      test: 'test1',
    }
  }
}

export default new Imgur()

/**
 * Imgur destination settings.
 */
export interface ImgurSettings extends DestinationSettings {
  test: string
}
