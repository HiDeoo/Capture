import React from 'react'
import tw from 'twin.macro'

import ToolBar, { ToolbarLockedProps } from './ToolBar'

const StyledToolbar = tw(ToolBar)`text-xs`

const EditorInfoBar: React.FC<Props> = ({ path }) => {
  return (
    <StyledToolbar bottom>
      <div>{path}</div>
      <div tw="flex-1" />
    </StyledToolbar>
  )
}

export default EditorInfoBar

interface Props extends ToolbarLockedProps {
  path: string
}
