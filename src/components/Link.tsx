import React from 'react'

import { getIpcRenderer } from '../main/ipc'

const Link: React.FC<Props> = ({ children, url }) => {
  function onClickLink(event: React.MouseEvent<HTMLAnchorElement>): Promise<void> {
    event.preventDefault()

    return getIpcRenderer().invoke('openUrl', url)
  }

  return (
    <a href={url} onClick={onClickLink}>
      {children}
    </a>
  )
}

export default Link

interface Props {
  children: string
  url: string
}
