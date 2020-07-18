import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Button from './Button'

const SettingsButton = styled(Button)`
  ${tw`border border-solid px-4 rounded-md mb-2 mr-2 font-semibold`}

  background-color: ${theme('settings.button.background')};
  border-color: ${theme('settings.button.border')};
  padding-bottom: 7px;
  padding-top: 7px;

  &:hover {
    background-color: ${theme('settings.button.hover.background')};
    border-color: ${theme('settings.button.hover.border')};
    color: ${theme('settings.button.hover.color')};
  }

  &:last-of-type {
    ${tw`mb-0 mr-0`}
  }
`

const SettingsGroupTitle = styled.div`
  ${tw`text-lg font-semibold mb-3 border-b border-solid`}

  border-color: rgb(255, 255, 255, 0.9);
  padding-bottom: 8px;
`

const SettingsGroup: React.FC<SettingsGroupProps> = ({ children, title }) => {
  return (
    <div>
      <SettingsGroupTitle>{title}</SettingsGroupTitle>
      {children}
    </div>
  )
}

interface SettingsGroupProps {
  title: string
}

export { SettingsButton as Button, SettingsGroup as Group }
