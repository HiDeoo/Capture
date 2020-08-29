import React from 'react'
import { theme } from 'styled-tools'
import tw, { styled } from 'twin.macro'

import IconImage from '../images/icon.png'
import { getIpcRenderer } from '../main/ipc'
import { formatBugReport } from './ErrorBoundary'
import Link from './Link'
import { Button, P } from './SettingsUi'

/**
 * Capture Github repository URL.
 */
const RepoUrl = 'https://github.com/HiDeoo/Capture'

/**
 * Configuration of the about settings panel.
 */
export const ABOUT_SETTINGS_CONFIGURATION = {
  id: 'about',
  name: 'About',
} as const

const Wrapper = styled.div`
  ${tw`h-full flex flex-col justify-center items-center`}

  a {
    color: ${theme('about.link')};

    &:hover:not(:disabled) {
      ${tw`underline`}
    }
  }
`

const AppIcon = styled.img`
  ${tw`mb-5`}

  width: 160px;
`

const Name = tw.div`text-2xl font-bold`
const Version = tw.span`italic`

const Description = styled.div`
  ${tw`mb-8`}

  color: ${theme('about.description')};
  font-size: 0.84rem;
  margin-top: 0.15rem;
`

const Entry = styled(P)`
  ${tw`mb-3`}
`

const Coffee = styled.span`
  ${tw`ml-2 text-lg`}
`

const StyledButton = styled(Button)`
  ${tw`mt-8 mr-3`}
`

const AboutSettings: React.FC = () => {
  async function onClickReportIssue(): Promise<void> {
    const infos = await getIpcRenderer().invoke('getBugReportInfos')

    const report = formatBugReport(process.env.REACT_APP_VERSION, infos.os)
    const url = `${process.env.REACT_APP_BUGS_URL}/new?body=${report}`

    return getIpcRenderer().invoke('openUrl', url)
  }

  async function onClickChangelog(): Promise<void> {
    return getIpcRenderer().invoke('openUrl', `${RepoUrl}/blob/master/CHANGELOG.md`)
  }

  return (
    <Wrapper>
      <AppIcon src={IconImage} alt="Capture Icon" />
      <Name>
        Capture <Version>v{process.env.REACT_APP_VERSION}</Version>
      </Name>
      <Description>Capture & Share screenshots…</Description>
      <Entry>
        Brewed using lots of
        <Coffee>☕</Coffee>
      </Entry>
      <Entry>
        Source code available on <Link url={RepoUrl}>Github</Link>
      </Entry>
      <Entry>
        <StyledButton onClick={onClickReportIssue}>Report issue</StyledButton>
        <StyledButton onClick={onClickChangelog}>Changelog</StyledButton>
      </Entry>
    </Wrapper>
  )
}

export default AboutSettings
