import 'twin.macro'

import React, { useEffect, useState } from 'react'

import { getDestination } from '../destinations'
import { getIpcRenderer } from '../main/ipc'
import { useHistory, useSettings } from '../store'
import { HistoryEntry } from '../store/history'
import Checkbox from './Checkbox'
import { AppError, useErrorHandler } from './ErrorBoundary'
import LoadingBar from './LoadingBar'
import Modal, { ModalButton, ModalProps } from './Modal'

const initialOptions = { destination: false, disk: false }

const DeleteModal: React.FC<Props> = ({ entry, open, opened }) => {
  const handleError = useErrorHandler()
  const { markAsDeletedOnDestination, markAsDeletedOnDisk, selectEntry } = useHistory()
  const { getDestinationSettingsGetter, getDestinationSettingsSetter } = useSettings()

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

  async function onClickOk(): Promise<void> {
    if (!options.destination && !options.disk) {
      open(false)

      return
    }

    setLocked(true)

    try {
      if (options.disk) {
        await getIpcRenderer().invoke('deleteFile', entry.path)
        markAsDeletedOnDisk(entry)
      }

      if (options.destination) {
        await destination.delete(
          { anon: entry.anon, deleteId: entry.deleteId },
          getDestinationSettingsGetter(entry.destinationId),
          getDestinationSettingsSetter(entry.destinationId)
        )
        markAsDeletedOnDestination(entry)
      }

      if (options.disk && options.destination) {
        selectEntry()
      }
    } catch (error) {
      handleError(new AppError('Something went wrong while deleting the image.', error, true))
    } finally {
      setLocked(false)
      open(false)
    }
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
      <div tw="mb-2">Pick where to delete the screenshot:</div>
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
