import React from 'react'
import tw, { styled } from 'twin.macro'

import { useSettings } from '../store'
import { ShortcutId } from '../utils/keyboard'
import Shortcut from './Shortcut'

const Wrapper = tw.div`w-full flex flex-col items-center justify-center font-semibold`
const Title = tw.div`text-5xl font-bold`

const StyledShorcut = styled(Shortcut)`
  ${tw`mt-8 mb-10`}

  && > button {
    ${tw`mr-0`}

    height: unset;
    min-width: unset;

    & > div {
      ${tw`py-1`}

      & > span {
        ${tw`text-xl`}

        &:last-child {
          ${tw`mr-1`}
        }
      }
    }

    & .icon {
      ${tw`hidden`}
    }

    &:disabled {
      ${tw`cursor-default`}
    }
  }
`

const LibraryNis: React.FC<{}> = () => {
  const { shortcuts } = useSettings()

  return (
    <Wrapper>
      <Title>Start capturing & sharing…</Title>
      <StyledShorcut shortcut={shortcuts[ShortcutId.CaptureScreenshot]} label="" />
    </Wrapper>
  )
}

export default LibraryNis
