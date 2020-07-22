/**
 * Returns the data from a data URL, removing the prefix, MIME type and the optional `base64` token.
 * @param  dataUrl - The data URL.
 * @return The data.
 */
function getDataFromDataUrl(dataUrl: string): string {
  return dataUrl.split(',')[1]
}

/**
 * Merge multiple images using a canvas.
 * @param  images - The images to merge.
 * @param  width - The width of the final image.
 * @param  height - The height of the final image.
 * @return The data of the final image.
 */
export function mergeImages(images: CanvasImageSource[], width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No canvas context to merge images.')
  }

  images.forEach((image) => {
    ctx.drawImage(image, 0, 0, width, height)
  })

  return getDataFromDataUrl(canvas.toDataURL())
}
