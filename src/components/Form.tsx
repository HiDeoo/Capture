import React from 'react'

const Form: React.FC<Props> = ({ children, onSubmit }) => {
  function onSubmitForm(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    onSubmit(event)
  }

  return <form onSubmit={onSubmitForm}>{children}</form>
}

export default Form

interface Props extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}
