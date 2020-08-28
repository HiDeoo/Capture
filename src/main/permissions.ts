import { app, dialog } from 'electron'
import {
  hasPromptedForPermission,
  hasScreenCapturePermission,
  openSystemPreferences,
} from 'mac-screen-capture-permissions'

/**
 * Ensures permissions are correct for the application.
 * If not, the user will be prompted to grant the proper permissions.
 * @return `true` when the permissions are correct.
 */
export function ensurePermissions(): boolean {
  const didPrompt = hasPromptedForPermission()
  const canScreenCapture = hasScreenCapturePermission()

  // If permissions are correct, we're done.
  if (canScreenCapture) {
    return true
  }

  // As we didn't prompt the user before, a permission dialog will be shown to the user automatically.
  if (!didPrompt) {
    return false
  }

  // If we don't have correct permissions and already prompted the user about it, we need to show a dialog to enforce
  // these permissions.
  void showPermissionsWarning()

  return false
}

async function showPermissionsWarning(): Promise<void> {
  await dialog.showMessageBox({
    buttons: ['Open System Preferences'],
    defaultId: 0,
    detail:
      'Capture requires screen capture permission. You can grant this permission in the System Preferences and then, launch Capture again.',
    message: 'The application cannot capture the screen.',
    type: 'warning',
  })

  await openSystemPreferences()

  app.quit()
}
