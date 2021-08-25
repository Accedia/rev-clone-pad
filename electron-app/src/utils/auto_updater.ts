import { app, autoUpdater, dialog } from 'electron';

const server = 'https://electron-hazel.vercel.app/';
const url = `${server}/update/${process.platform}/${app.getVersion()}`;

export const setupAutoUpdater = () => {
  autoUpdater.on('checking-for-update', () => {
    console.log('checking for update');
  });

  autoUpdater.on('error', (error: any) => {
    console.log('error', error);
  });

  autoUpdater.on('update-available', () => {
    console.log('update-available');
  });

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.',
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.setFeedURL({ url });
  autoUpdater.checkForUpdates();
};
