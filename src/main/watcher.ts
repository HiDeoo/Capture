import chokidar, { FSWatcher } from 'chokidar'
import { constants, promises as fs, Stats } from 'fs'

/**
 * Installs a created file watcher in a specific directory.
 * @param  directoryPath - The directory to watch.
 * @param  callback - The callback to call when a file is created.
 * @param  extension - The file extension.
 * @return The file watcher.
 */
export async function installCreatedFileWatcher(
  directoryPath: string,
  callback: (createdFilePath: string, size: number) => void,
  extension = 'png'
): Promise<FSWatcher> {
  await fs.access(directoryPath, constants.R_OK)

  const watcher = chokidar.watch(`${directoryPath}/*.${extension}`, {
    alwaysStat: true,
    depth: 0,
    // Ignore dotfiles (looks like screencapture can create a temporary hidden file).
    ignored: /(^|[/\\])\../,
    ignoreInitial: true,
  })

  watcher.on('add', (path: string, stats: Stats) => {
    callback(path, stats.size)
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
