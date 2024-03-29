export enum UpdateStatus {
  Checking = 'checking',
  NoUpdates = 'no_updates',
  UpdatesAvailable = 'updates_available',
  Downloading = 'downloading',
  Installing = 'installing',
  Complete = 'complete',
  Error = 'error',
}

export const UPDATE_STATUS_MESSAGES: Record<UpdateStatus, string> = {
  [UpdateStatus.Checking]: 'Checking for updates...',
  [UpdateStatus.NoUpdates]: 'Up to date.',
  [UpdateStatus.UpdatesAvailable]: 'Updates are available!',
  [UpdateStatus.Downloading]: 'Downloading latest update...',
  [UpdateStatus.Installing]: 'Installing latest update...',
  [UpdateStatus.Complete]: 'Success! App will now restart...',
  [UpdateStatus.Error]: 'Oops! An error occured while updating. Please contact FIT!'
}

export const UPDATE_STATUS_COLOR: Record<UpdateStatus, string> = {
  [UpdateStatus.Checking]: 'blue',
  [UpdateStatus.NoUpdates]: 'blue',
  [UpdateStatus.UpdatesAvailable]: 'blue',
  [UpdateStatus.Downloading]: 'blue',
  [UpdateStatus.Installing]: 'teal',
  [UpdateStatus.Complete]: 'teal',
  [UpdateStatus.Error]: 'red'
}