import React from 'react'
import styled from 'styled-components/macro'
import { theme } from 'styled-tools'
import tw from 'tailwind.macro'

import Button from './Button'

const SettingsP = styled.p`
  ${tw`mb-1`}

  &:last-of-type {
    ${tw`mb-0`}
  }
`

const SettingsButton = styled(Button)`
  ${tw`border border-solid px-4 rounded-md mb-2 mr-2 font-semibold`}

  background-color: ${theme('settings.button.background')};
  border-color: ${theme('settings.button.border')};
  padding-bottom: 7px;
  padding-top: 7px;

  &:hover:not(:disabled) {
    background-color: ${theme('settings.button.hover.background')};
    border-color: ${theme('settings.button.hover.border')};
    color: ${theme('settings.button.hover.color')};
  }

  &:disabled {
    opacity: 0.6;
  }

  &:last-of-type {
    ${tw`mb-0 mr-0`}
  }


  ${SettingsP} + & {
    ${tw`mt-2`}
  }
`

const SettingsGroupWrapper = styled.div`
  ${tw`mt-4`}

  &:first-child {
    ${tw`mt-0`}
  }
`

const SettingsGroupTitle = styled.div`
  ${tw`text-lg mb-4 font-semibold border-b border-solid`}

  border-color: rgb(255, 255, 255, 0.7);
  padding-bottom: 8px;
`

const SettingsGroup: React.FC<SettingsGroupProps> = ({ children, title }) => {
  return (
    <SettingsGroupWrapper>
      <SettingsGroupTitle>{title}</SettingsGroupTitle>
      {children}
    </SettingsGroupWrapper>
  )
}

interface SettingsGroupProps {
  title: string
}

export { SettingsP as P, SettingsButton as Button, SettingsGroup as Group }
