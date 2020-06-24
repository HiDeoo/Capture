import chokidar, { FSWatcher } from 'chokidar'

/**
 * Installs a created file watcher in a specific directory.
 * @param  directoryPath - The directory to watch.
 * @param  callback - The callback to call when a file is created.
 * @param  extension - The file extension.
 * @return The file watcher.
 */
export function installCreatedFileWatcher(
  directoryPath: string,
  callback: (createdFilePath: string) => void,
  extension = 'png'
): FSWatcher {
  const watcher = chokidar.watch(`${directoryPath}/*.${extension}`, {
    depth: 0,
    // Ignore dotfiles (looks like screencapture can create a temporary hidden file).
    ignored: /(^|[/\\])\../,
    ignoreInitial: true,
  })

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
