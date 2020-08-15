import React, { useEffect } from 'react'
import { ErrorBoundary as Boundary, FallbackProps, useErrorHandler } from 'react-error-boundary'

import { getIpcRenderer } from '../main/ipc'
import Modal, { ModalButton, useModal } from './Modal'

export { useErrorHandler }

/**
 * Custom error class that should be used for errors with a user facing message.
 */
export class AppError extends Error {
  constructor(message: string, public internalError?: Error) {
    super()

    this.message = message

    Object.setPrototypeOf(this, AppError.prototype)
  }
}

const ErrorBoundary: React.FC<Props> = ({ children, primaryButtonHandler, primaryButtonLabel }) => {
  function renderFallback(props: FallbackProps): React.ReactElement {
    return (
      <ErrorFallback {...props} primaryButtonLabel={primaryButtonLabel} primaryButtonHandler={primaryButtonHandler} />
    )
  }

  return <Boundary fallbackRender={renderFallback}>{children}</Boundary>
}

const ErrorFallback: React.FC<FallbackProps & Props> = ({
  error,
  componentStack,
  primaryButtonHandler,
  primaryButtonLabel,
  resetErrorBoundary,
}) => {
  const { isModalOpened, openModal } = useModal()

  const message = error instanceof AppError ? error.message : 'Something went wrong!'

  useEffect(() => {
    if (error) {
      openModal(true)
    } else {
      openModal(false)
    }
  }, [error, openModal])

  function onClickQuit(): Promise<void> {
    return getIpcRenderer().invoke('quit')
  }

  async function onClickReport(): Promise<void> {
    const infos = await getIpcRenderer().invoke('getBugReportInfos')

    const report = formatBugReport(process.env.REACT_APP_VERSION, infos.os, error, componentStack)
    const url = `${process.env.REACT_APP_BUGS_URL}/new?body=${report}`

    return getIpcRenderer().invoke('openUrl', url)
  }

  function onClickPrimaryButton(): void {
    if (primaryButtonHandler) {
      primaryButtonHandler(resetErrorBoundary)
    } else {
      window.location.reload()
    }
  }

  return (
    <Modal
      title="Error"
      closable={false}
      open={openModal}
      opened={isModalOpened}
      buttons={[
        <ModalButton children="Quit" onClick={onClickQuit} />,
        <ModalButton children="Report" onClick={onClickReport} />,
        <ModalButton children={primaryButtonLabel ?? 'Reload'} onClick={onClickPrimaryButton} />,
      ]}
    >
      {message}
    </Modal>
  )
}

export default ErrorBoundary

/**
 * Formats a bug reports.
 * @param  version - The application version.
 * @param  os - The OS name & version.
 * @param  error - The error that triggered the bug report.
 * @param  componentStack - The component stack associated to the error.
 * @return The formatted bug report.
 */
function formatBugReport(version: string, os: string, error?: Error | AppError, componentStack?: string): string {
  return encodeURIComponent(`<!---
Thanks for filing an issue 😄 !
Please provide as much details as possible, including screenshots if necessary.
-->

**Describe the bug**

A clear and concise description of what the bug is.

**To Reproduce**

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**

A clear and concise description of what you expected to happen.

**Screenshots**

If applicable, add screenshots to help explain your problem.

**Error**

\`\`\`
${error}${
    error instanceof AppError && error.internalError
      ? `
Internal ${error.internalError}`
      : ''
  }
${componentStack}
\`\`\`

**Environment**

| Software         | Version               |
| ---------------- | --------------------- |
| Capture          | ${version}            |
| Operating System | ${os}                 |
`)
}

interface Props {
  primaryButtonHandler?: (resetErrorBoundary: () => void) => void
  primaryButtonLabel?: string
}
