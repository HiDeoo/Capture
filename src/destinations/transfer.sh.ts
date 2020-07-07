import fetch from 'isomorphic-fetch'

import { getUploadStreamData } from '../main/files'
import Destination, { DestinationConfiguration, DestinationSettings } from '../utils/Destination'

/**
 * Transfer.sh destination.
 */
class TransferSh implements Destination {
  /**
   * Returns the destination configuration.
   */
  getConfiguration(): DestinationConfiguration {
    return {
      id: 'transfer.sh',
      name: 'Transfer.sh',
    }
  }

  /**
   * Returns the destination default settings.
   */
  getDefaultSettings(): DestinationSettings {
    return {}
  }

  /**
   * Share a file to Transfer.sh.
   * @param filePath - The path of the file to share.
   */
  async share(filePath: string): Promise<void> {
    const { size, stream } = await getUploadStreamData(filePath)

    // TODO Stop hardcoding the name
    const response = await fetch(' https://transfer.sh/test.png', {
      method: 'PUT',
      headers: {
        'Content-length': size,
      },
      body: stream,
    })

    const text = await response.text()

    if (!response.ok) {
      // TODO Refactor & handle errors
      throw new Error(`Could not share screenshot to ${this.getConfiguration().name}.\n\n${text}`)
    }

    console.log('Shared URL ', text)
  }
}

export default new TransferSh()
