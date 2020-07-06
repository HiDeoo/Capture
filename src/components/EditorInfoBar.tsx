import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import ToolBar from './ToolBar'

/**
 * StyledToolbar component.
 */
const StyledToolbar = styled(ToolBar)`
  ${tw`text-xs`}
`

/**
 * EditorInfoBar Component.
 */
const EditorInfoBar: React.FC<Props> = ({ filePath }) => {
  return (
    <StyledToolbar bottom>
      <div>{filePath}</div>
      <div css={tw`flex-1`} />
    </StyledToolbar>
  )
}

export default EditorInfoBar

/**
 * React Props.
 */
interface Props {
  filePath: string
}
