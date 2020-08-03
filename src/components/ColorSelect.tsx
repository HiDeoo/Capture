import { lighten } from 'polished'
import React from 'react'
import styled from 'styled-components/macro'
import tw from 'tailwind.macro'

import Select from './Select'

export enum ColorType {
  Background,
  Border,
}

export const Colors: Color[] = [
  '#ff2700',
  '#fe9400',
  '#fefb05',
  '#0bf900',
  '#00fdff',
  '#0532fe',
  '#ff42ff',
  '#942092',
  '#ab7942',
  '#ffffff',
  '#919292',
  '#000000',
]

const Option = styled.div`
  ${tw`border border-solid`}

  height: 19px;
  margin-top: 1px;
  width: 100%;
`

const Preview = styled.div`
  ${tw`border border-solid border-white flex`}

  height: 15px;
  margin-bottom: 1px;
  width: 16px;
`

const PreviewElement = styled.div`
  ${tw`border border-solid flex-1 flex`}
`

const ColorSelect: React.FC<Props> = ({ onChangeColor, selectedColor, type }) => {
  function colorRenderer(color: Color, isOption: boolean): React.ReactNode {
    if (!isOption) {
      if (type === ColorType.Border) {
        return (
          <Preview className="colorSelectBorderPreview">
            <PreviewElement style={{ borderColor: color, borderWidth: 2 }}>
              <PreviewElement style={{ borderColor: 'white' }} />
            </PreviewElement>
          </Preview>
        )
      } else {
        throw new Error('Unsupported color type.')
      }
    }

    return <Option style={{ backgroundColor: color, borderColor: lighten(0.1, color) }} />
  }

  return <Select items={Colors} onChange={onChangeColor} itemRenderer={colorRenderer} selectedItem={selectedColor} />
}

export default ColorSelect

interface Props {
  onChangeColor: (color: Color) => void
  selectedColor: Color
  type: ColorType
}

export type Color = string
