import React from 'react'

const Img: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = ({
  alt = '',
  draggable = false,
  ...restProps
}) => {
  return <img {...restProps} alt={alt} draggable={draggable} />
}

export default Img
