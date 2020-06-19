import nsfw, { NSFW } from 'nsfw'
import path from 'path'

/**
 * Installs a created file watcher in a specific directory.
 * @param  directoryPath - The directory to watch.
 * @param  callback - The callback to call when a file is created.
 * @return The file watcher.
 */
export async function installCreatedFileWatcher(
  directoryPath: string,
  callback: (createdFilePath: string) => void
): Promise<NSFW> {
  const watcher = await nsfw(directoryPath, (events) => {
    for (const event of events) {
      if (isCreatedFileEvent(event)) {
        // TODO Ensure the file extension / type is valid
        callback(path.join(event.directory, event.file))
      }
    }
  })

  await watcher.start()

  return watcher
}

/**
 * Uninstalls a file watcher.
 * @param watcher - The watcher to uninstall.
 */
export function uninstallFileWatcher(watcher: NSFW): Promise<void> {
  return watcher.stop()
}

/**
 * Checks if a file event returned by nsfw is a created file event.
 * Note: we cannot use the `ActionType` enum exported as a `const enum` due to the `--isolatedModules` tsc flag.
 * @param  event - The file change event.
 * @return `true` when the event is associated to a file creation.
 */
function isCreatedFileEvent(event: unknown): event is CreatedFileEvent {
  return (event as FileChangeEvent).action !== undefined && (event as FileChangeEvent).action === 0
}

/**
 * Event describing a file change emitted by nsfw.
 * @see isCreatedFileEvent
 */
interface FileChangeEvent {
  action: 0 | 1 | 2 | 3
  directory: string
  file: string
}

/**
 * Event describing a created fileemitted by nsfw.
 * @see isCreatedFileEvent
 */
interface CreatedFileEvent extends FileChangeEvent {
  action: 0
}
