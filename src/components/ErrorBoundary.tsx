import React, { useEffect } from 'react'
import { ErrorBoundary as Boundary, FallbackProps, useErrorHandler } from 'react-error-boundary'

import { getIpcRenderer } from '../main/ipc'
import Modal, { ModalButton, useModal } from './Modal'

export { useErrorHandler }

export class AppError extends Error {
  constructor(message: string, public internalError?: Error) {
    super()

    this.message = message

    Object.setPrototypeOf(this, AppError.prototype)
  }
}

const ErrorBoundary: React.FC = ({ children }) => {
  return <Boundary FallbackComponent={ErrorFallback}>{children}</Boundary>
}

const ErrorFallback: React.FC<FallbackProps> = ({ error, componentStack, resetErrorBoundary }) => {
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

  function onClickReload(): void {
    window.location.reload()
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
        <ModalButton children="Reload" onClick={onClickReload} />,
      ]}
    >
      {message}
    </Modal>
  )
}

export default ErrorBoundary

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
