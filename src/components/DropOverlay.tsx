import React from 'react'
import { styled } from 'twin.macro'

const Wrapper = styled.div`
  background-color: red;
`

const DropOverlay: React.FC<Props> = ({ isDragActive }) => {
  if (!isDragActive) {
    return null
  }

  return <Wrapper>DropOverlay</Wrapper>
}

export default DropOverlay

interface Props {
  isDragActive: boolean
}
