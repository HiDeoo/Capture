import chokidar, { FSWatcher } from 'chokidar'

/**
 * Installs a created file watcher in a specific directory.
 * @param  directoryPath - The directory to watch.
 * @param  callback - The callback to call when a file is created.
 * @return The file watcher.
 */
export function installCreatedFileWatcher(
  directoryPath: string,
  callback: (createdFilePath: string) => void
): FSWatcher {
  const watcher = chokidar.watch(directoryPath, { ignoreInitial: true, depth: 0 })

  watcher.on('add', (filePath: string) => {
    callback(filePath)
  })

  return watcher
}

/**
 * Uninstalls a file watcher.
 * @param watcher - The watcher to uninstall.
 */
export function uninstallFileWatcher(watcher: FSWatcher): Promise<void> {
  return watcher.close()
}
