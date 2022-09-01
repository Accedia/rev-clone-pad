export enum UpdateStatus {
  Checking = 'checking',
  Downloading = 'downloading',
  Installing = 'installing',
  Complete = 'complete',
  Error = 'error',
}

export const UPDATE_STATUS_MESSAGES: Record<UpdateStatus, string> = {
  [UpdateStatus.Checking]: 'Checking for updates...',
  [UpdateStatus.Downloading]: 'Downloading latest update...',
  [UpdateStatus.Installing]: 'Installing latest update...',
  [UpdateStatus.Complete]: 'Update installed successfully! Restarting...',
  [UpdateStatus.Error]: 'Oops! Something went wrong while installing latest update.'
}