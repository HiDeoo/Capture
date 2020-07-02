import Destination, { DestinationConfiguration, DestinationSettings } from '../utils/Destination'

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

  /**
   * Share a file to Imgur.
   * @param filePath - The path of the file to share.
   */
  async share(filePath: string): Promise<void> {
    console.log('filePath ', filePath)

    // TODO Add implementation

    return Promise.resolve()
  }
}

export default new Imgur()

/**
 * Imgur destination settings.
 */
export interface ImgurSettings extends DestinationSettings {
  test: string
}
