import 'styled-components/macro'

import React, { useEffect, useState } from 'react'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import { HistoryEntry } from '../store/history'
import Checkbox from './Checkbox'
import Modal, { ModalButton, ModalProps } from './Modal'

const initialOptions = { destination: false, disk: false }

const DeleteModal: React.FC<Props> = ({ entry, open, opened }) => {
  const [options, setOptions] = useState(initialOptions)
  const destination = getDestination(entry.destinationId)

  useEffect(() => {
    if (!opened) {
      setOptions(initialOptions)
    }
  }, [opened])

  function onChangeDisk(checked: boolean): void {
    setOptions((prevOptions) => ({ ...prevOptions, disk: checked }))
  }

  function onChangeDestination(checked: boolean): void {
    setOptions((prevOptions) => ({ ...prevOptions, destination: checked }))
  }

  function onClickOk(): void {
    open(false)
  }

  return (
    <Modal
      open={open}
      title="Delete"
      opened={opened}
      closeButtonLabel="Cancel"
      buttons={[<ModalButton children="Ok" onClick={onClickOk} />]}
    >
      <div css={tw`mb-2`}>Pick where to delete the screenshot:</div>
      <Checkbox
        checked={options.disk}
        onChange={onChangeDisk}
        disabled={entry.deleted.disk}
        label={entry.deleted.disk ? 'Already deleted from disk' : 'Delete from disk'}
      />
      <Checkbox
        checked={options.destination}
        onChange={onChangeDestination}
        disabled={entry.deleted.destination}
        label={
          entry.deleted.destination
            ? `Already deleted from ${destination.getConfiguration().name}`
            : `Delete from ${destination.getConfiguration().name}`
        }
      />
    </Modal>
  )
}

export default DeleteModal

interface Props extends Pick<ModalProps, 'open' | 'opened'> {
  entry: HistoryEntry
}
