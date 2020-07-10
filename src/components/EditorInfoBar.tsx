import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import ToolBar, { ToolbarLockedProps } from './ToolBar'

const StyledToolbar = styled(ToolBar)`
  ${tw`text-xs`}
`

const EditorInfoBar: React.FC<Props> = ({ filePath }) => {
  return (
    <StyledToolbar bottom>
      <div>{filePath}</div>
      <div css={tw`flex-1`} />
    </StyledToolbar>
  )
}

export default EditorInfoBar

interface Props extends ToolbarLockedProps {
  filePath: string
}
