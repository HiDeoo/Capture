import Destination, { DestinationConfiguration } from '../libs/Destination'

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
}

export default new Imgur()
