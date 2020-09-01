import fileSize from 'filesize'
import React from 'react'
import tw from 'twin.macro'

import type { ImageDimensions } from './Img'
import ToolBar, { ToolbarLockedProps } from './ToolBar'

const StyledToolbar = tw(ToolBar)`text-xs`

const EditorInfoBar: React.FC<Props> = ({ dimensions, path, size }) => {
  return (
    <StyledToolbar bottom>
      <div>{path}</div>
      <div tw="flex-1" />
      {dimensions && (
        <>
          <div>
            {dimensions.width}px x {dimensions.height}px
          </div>
          <div> - </div>
        </>
      )}
      <div>{fileSize(size, { round: 0 })}</div>
    </StyledToolbar>
  )
}

export default EditorInfoBar

interface Props extends ToolbarLockedProps {
  dimensions?: ImageDimensions
  path: string
  size: number
}
