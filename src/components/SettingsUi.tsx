import React from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import Button from './Button'
import Checkbox from './Checkbox'
import Input from './Input'
import Path, { PathProps } from './Path'

const SettingsP = styled.div`
  ${tw`mb-1`}

  margin-left: 1px;

  &:last-of-type {
    ${tw`mb-0`}
  }
`

const SettingsButton = styled(Button)`
  ${tw`border border-solid px-4 rounded-md mb-2 mr-2 font-semibold focus:shadow-outline`}

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

const SettingsCheckbox = styled(Checkbox)`
  & > span:first-of-type {
    background-color: ${theme('settings.button.background')};
  }
`

const SettingsWarningWrapper = styled.div`
  ${tw`border-orange-500 border p-3 rounded-md mb-4`}

  background-color: ${theme('settings.warning.background')};
  border-left-width: 5px;
`

const SettingsWarning: React.FC = ({ children }) => {
  return <SettingsWarningWrapper>{children}</SettingsWarningWrapper>
}

const SettingsLoginRequired: React.FC<SettingsLoginRequiredProps> = ({ destinationName, visible }) => {
  if (!visible) {
    return null
  }

  return <SettingsWarning>Sharing screenshots to {destinationName} requires to be logged in.</SettingsWarning>
}

const SettingsInput = styled(Input)`
  ${tw`border border-solid px-4 rounded-md mb-2 mr-2 font-medium`}

  background-color: ${theme('settings.button.background')};
  border-color: ${theme('settings.button.border')};
  padding-bottom: 7px;
  padding-top: 7px;

  &:disabled {
    opacity: 0.6;
  }

  &:read-only {
    ${tw`shadow-none cursor-not-allowed text-gray-200`}
  }

  &[type=submit] {
    &:hover:not(:disabled) {
      ${tw`cursor-pointer`}

      background-color: ${theme('settings.button.hover.background')};
      border-color: ${theme('settings.button.hover.border')};
      color: ${theme('settings.button.hover.color')};
    }
  }

  ${SettingsP} + & {
    ${tw`mt-3`}
  }
`

export {
  SettingsButton as Button,
  SettingsCheckbox as Checkbox,
  SettingsGroup as Group,
  SettingsInput as Input,
  SettingsLoginRequired as LoginRequired,
  SettingsP as P,
  SettingsPath as Path,
}

interface SettingsGroupProps {
  title: string
}

interface SettingsLoginRequiredProps {
  destinationName: string
  visible: boolean
}
