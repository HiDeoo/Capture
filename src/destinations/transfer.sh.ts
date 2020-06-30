import fetch from 'isomorphic-fetch'

import Destination, { DestinationConfiguration, DestinationSettings } from '../libs/Destination'
import { getUploadStreamData } from '../main/files'

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

    const response = await fetch(' https://transfer.sh/test.png', {
      method: 'PUT',
      headers: {
        'Content-length': size,
      },
      body: stream,
    })

    const text = await response.text()

    console.log('Shared URL ', text)
  }
}

export default new TransferSh()
