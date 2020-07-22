import React, { useMemo, useRef, useState } from 'react'
import { SketchField, Tools } from 'react-sketch2'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Img, { ImageSize } from './Img'

const Layers = styled.div`
  ${tw`relative inline-block border border-solid`}

  border-color: ${theme('editor.border')};

  & > img {
    max-height: unset;
    max-width: unset;
  }
`

export function useImageEditor(): ImageEditorHook {
  const imageEditorSketch = useRef<SketchField>()
  const imageEditorImage = useRef<HTMLImageElement>(null)

  const imageEditorUtils = useMemo(
    () => ({
      hasAnnotations(): boolean {
        if (!imageEditorSketch.current) {
          return false
        }

        const json = imageEditorSketch.current.toJSON()

        return json.objects.length > 0
      },
      getImages(): Optional<CanvasImageSource[]> {
        if (!imageEditorImage.current || !imageEditorSketch.current) {
          return
        }

        return [imageEditorImage.current, imageEditorSketch.current._fc.toCanvasElement(window.devicePixelRatio)]
      },
    }),
    []
  )

  return {
    imageEditorImage,
    imageEditorSketch,
    imageEditorUtils,
  }
}

interface ImageEditorHook {
  imageEditorImage: React.RefObject<HTMLImageElement>
  imageEditorSketch: React.MutableRefObject<SketchField | undefined>
  imageEditorUtils: {
    getImages: () => Optional<CanvasImageSource[]>
    hasAnnotations: () => boolean
  }
}

const ImageEditor: React.FC<Props> = ({ image, path, sketch }) => {
  const [imageSize, setImageSize] = useState<Optional<ImageSize>>()

  function setSketchRef(ref: SketchField): void {
    sketch.current = ref
  }

  function onImageLoaded(): void {
    if (image.current) {
      setImageSize({ height: image.current.height, width: image.current.width })
    }
  }

  return (
    <Layers>
      <Img src={path} onLoad={onImageLoaded} ref={image} />
      <div css={tw`absolute inset-0`}>
        <SketchField
          lineWidth={3}
          lineColor="black"
          ref={setSketchRef}
          tool={Tools.Pencil}
          width={imageSize?.width}
          height={imageSize?.height}
        />
      </div>
    </Layers>
  )
}

interface Props {
  image: ImageEditorHook['imageEditorImage']
  path: string
  sketch: ImageEditorHook['imageEditorSketch']
}

export default ImageEditor
