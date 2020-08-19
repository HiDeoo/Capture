import React from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import Button from './Button'
import Path, { PathProps } from './Path'

const SettingsP = styled.div`
  ${tw`mb-1`}

  margin-left: 1px;

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
    ${tw`mt-3`}
  }
`

const SettingsGroupWrapper = tw.div`mt-4 first:mt-0`

const SettingsGroupTitle = styled.div`
  ${tw`text-lg mb-4 font-semibold border-b border-solid`}

  border-color: rgb(255, 255, 255, 0.7);
  padding-bottom: 8px;
  padding-left: 1px;
`

const SettingsGroup: React.FC<SettingsGroupProps> = ({ children, title }) => {
  return (
    <SettingsGroupWrapper>
      <SettingsGroupTitle>{title}</SettingsGroupTitle>
      {children}
    </SettingsGroupWrapper>
  )
}

const SettingsPath: React.FC<PathProps> = (props) => {
  return (
    <SettingsP>
      <Path {...props} />
    </SettingsP>
  )
}

interface SettingsGroupProps {
  title: string
}

export { SettingsP as P, SettingsPath as Path, SettingsButton as Button, SettingsGroup as Group }
