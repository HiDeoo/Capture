import { createReadStream, promises as fs } from 'fs'

/**
 * Returns data used to upload a file from a stream.
 * @param  filePath - The path to the file.
 * @return The data including the file size and the associated stream.
 */
export async function getUploadStreamData(filePath: string): Promise<UploadStreamData> {
  const status = await fs.stat(filePath)
  const sizeInBytes = status.size
  const stream = createReadStream(filePath)

  return {
    size: sizeInBytes.toString(),
    // isomorphic-fetch types rely on the lib.dom.d.ts types for fetch which is an issue in the main process as we're
    // using a ReadStream from Node.
    stream: (stream as unknown) as ReadableStream,
  }
}

interface UploadStreamData {
  size: string
  stream: ReadableStream
}
