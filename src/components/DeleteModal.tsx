import 'styled-components/macro'

import React, { useEffect, useState } from 'react'
import tw from 'tailwind.macro'

import { getDestination } from '../destinations'
import { HistoryEntry } from '../store/history'
import Checkbox from './Checkbox'
import LoadingBar from './LoadingBar'
import Modal, { ModalButton, ModalProps } from './Modal'

const initialOptions = { destination: false, disk: false }

const DeleteModal: React.FC<Props> = ({ entry, open, opened }) => {
  const [locked, setLocked] = useState(false)
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
    if (!options.destination && !options.disk) {
      open(false)

      return
    }

    setLocked(true)
  }

  return (
    <Modal
      open={open}
      title="Delete"
      locked={locked}
      opened={opened}
      closeButtonLabel="Cancel"
      buttons={[<ModalButton disabled={locked} children="Ok" onClick={onClickOk} />]}
    >
      <LoadingBar enabled={locked} relative />
      <div css={tw`mb-2`}>Pick where to delete the screenshot:</div>
      <Checkbox
        checked={options.disk}
        onChange={onChangeDisk}
        disabled={locked || entry.deleted.disk}
        label={entry.deleted.disk ? 'Already deleted from disk' : 'Delete from disk'}
      />
      <Checkbox
        checked={options.destination}
        onChange={onChangeDestination}
        disabled={locked || entry.deleted.destination}
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
