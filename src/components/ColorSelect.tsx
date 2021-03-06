import { lighten } from 'polished'
import React from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import Select from './Select'
import Svg from './Svg'
import { TooltipProps } from './Tooltip'

export enum ColorType {
  Background,
  Border,
}

export const COLORS: Color[] = [
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

const TransparentColor = 'TRANSPARENT'

const Option = styled.div`
  ${tw`border border-solid`}

  height: ${theme('bar.color.optionSize')};
  margin-top: 1px;
  width: ${theme('bar.color.optionSize')};
`

const PreviewWrapper = styled.div`
  ${tw`border border-solid border-white flex`}

  height: ${theme('bar.color.size')};
  margin-bottom: 1px;
  width: ${theme('bar.color.size')};
`
const PreviewElement = tw.div`border border-solid flex-1 flex`

const TransparentPreview = styled.div`
  ${tw`border border-solid border-white flex`}

  height: ${theme('bar.color.size')};
  margin-bottom: 1px;
  width: ${theme('bar.color.size')};

  & > div {
    ${tw`relative w-full h-full`}

    & > svg {
      ${tw`absolute`}

      height: 13px;
      width: 13px;
      fill: ${theme('bar.color.transparentBackground')};
    }
  }
`

const ColorSelect: React.FC<Props> = ({
  allowTransparent = false,
  disabled = false,
  onChangeColor,
  selectedColor,
  tooltip,
  tooltipPlacement,
  type,
}) => {
  function colorRenderer(color: Optional<Color>, isOption: boolean): React.ReactNode {
    if (!isOption) {
      if (type === ColorType.Border) {
        return (
          <PreviewWrapper className="colorSelectBorderPreview">
            <PreviewElement style={{ borderColor: color, borderWidth: 2 }}>
              <PreviewElement style={{ borderColor: 'white' }} />
            </PreviewElement>
          </PreviewWrapper>
        )
      } else if (type === ColorType.Background) {
        if (color === TransparentColor) {
          return <TransparentBackground />
        } else {
          return (
            <PreviewWrapper className="colorSelectBackgroundPreview">
              <PreviewElement style={{ backgroundColor: color, borderWidth: 0 }} />
            </PreviewWrapper>
          )
        }
      } else {
        throw new Error('Unsupported color type.')
      }
    }

    if (color && color !== TransparentColor) {
      return <Option style={{ backgroundColor: color, borderColor: lighten(0.1, color) }} />
    }

    return <TransparentBackground />
  }

  function onChange(newColor: Optional<Color>): void {
    onChangeColor(newColor)
  }

  const selectedItem = !selectedColor && allowTransparent ? TransparentColor : selectedColor

  return (
    <Select
      tooltip={tooltip}
      onChange={onChange}
      disabled={disabled}
      selectedItem={selectedItem}
      itemRenderer={colorRenderer}
      tooltipPlacement={tooltipPlacement}
      items={allowTransparent ? [TransparentColor, ...COLORS] : COLORS}
    />
  )
}

export default ColorSelect

const TransparentBackground: React.FC = () => {
  return (
    <TransparentPreview className="colorSelectBackgroundPreview">
      <Svg icon="diagonal" />
    </TransparentPreview>
  )
}

interface Props {
  allowTransparent?: boolean
  disabled?: boolean
  onChangeColor: (color: Optional<Color>) => void
  selectedColor: Optional<Color>
  tooltip?: TooltipProps['content']
  tooltipPlacement?: TooltipProps['placement']
  type: ColorType
}

export type Color = string
