import React, { forwardRef } from 'react'

export default forwardRef<
  HTMLImageElement,
  React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
>(({ alt = '', draggable = false, ...restProps }, ref) => {
  return <img ref={ref} {...restProps} alt={alt} draggable={draggable} />
})

export interface ImageSize {
  height: number
  width: number
}
