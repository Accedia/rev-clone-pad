import { MESSAGE } from './../constants/messages';
import { app, autoUpdater, dialog, MessageBoxOptions, BrowserWindow } from 'electron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';

const server = 'https://electron-hazel.vercel.app';

interface HazelResponse {
  url: string;
  name: string;
  note: string;
  pub_date: string;
}

export class AutoUpdater {
  private window: BrowserWindow;
  public currentVersion: string;
  public latestVersion: string;
  public tempDir: string;

  constructor(window: BrowserWindow) {
    this.window = window;
    this.tempDir = '';
    this.currentVersion = app.getVersion();
    this.latestVersion = app.getVersion(); // will be overwritten later

    this.makeTempDir();
  }

  public checkAndDownloadUpdates = async () => {
    this.sendUpdate('Checking for updates');
    const { url, latestVersion } = await this.getLatestVersionInfo();

    const shouldUpdate = this.isUpdateAvailable(app.getVersion(), latestVersion);
    if (!shouldUpdate) {
      this.sendUpdate('No updates found');
      return false;
    }

    this.sendUpdate('Update found, downloading');

    const links = await this.getDownloadLinks(url, latestVersion);

    await Promise.all([
      this.download(links.releases.name, links.releases.url),
      this.download(links.nupkg.name, links.nupkg.url),
    ]);

    this.sendUpdate('Applying updates');
    try {
      await this.applyUpdates();
    } catch (e) {
      app.quit();
    }

    return true;
  };

  private isUpdateAvailable = (appVersion: string, latestVersion: string) => {
    const [appMajor, appMinor, appPatch] = appVersion.split('.');
    const [latestMajor, latestMinor, latestPatch] = latestVersion.split('.');

    if (appMajor < latestMajor) return true;
    if (appMajor === latestMajor && appMinor < latestMinor) return true;
    if (appMajor === latestMajor && appMinor === latestMinor && appPatch < latestPatch) return true;
    return false;
  };

  private getLatestVersionInfo = async () => {
    const hazelUrl = `${server}/update/win32/${this.currentVersion}/`;
    const { data } = await axios.get<HazelResponse>(hazelUrl);
    if (!data) {
      this.latestVersion = this.currentVersion;
      return {
        url: null,
        latestVersion: this.currentVersion,
      };
    }

    const { name, url } = data;

    const latestVersion = name.replace('v', '');
    this.latestVersion = latestVersion;

    return { url, latestVersion };
  };

  private getDownloadLinks = async (url: string, latestVersion: string) => {
    const baseUrl = url.substring(0, url.lastIndexOf('/'));

    const nupkgName = `/FitCCCInputAutomation-${latestVersion}-full.nupkg`;
    const releasesName = '/RELEASES';

    return {
      nupkg: {
        name: nupkgName,
        url: baseUrl + nupkgName,
      },
      releases: {
        name: releasesName,
        url: baseUrl + '/RELEASES',
      },
    };
  };

  private download = async (name: string, url: string) => {
    const finished = promisify(stream.finished);
    const filePath = `${this.tempDir}/${name}`;
    const writer = fs.createWriteStream(filePath, { flags: 'w+' });

    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(writer);

    return finished(writer);
  };

  private makeTempDir = () => {
    this.tempDir = path.join(app.getPath('temp'), 'NTWRK');
    if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir);
  };

  private sendUpdate = (update: string) => {
    this.window.webContents.send(MESSAGE.LOADER_CHECK_UPDATE_STATUS, update);
  };

  private applyUpdates = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      autoUpdater.on('checking-for-update', () => {
        // Nothing happens here, but can happen...
      });

      autoUpdater.on('error', (error: any) => {
        this.sendUpdate('Something went wrong, please restart');
        const dialogOpts: MessageBoxOptions = {
          type: 'error',
          buttons: ['Close'],
          title: 'Application Update',
          message: 'Could not update application',
          detail: `Something went wrong with the app update: ${error}`,
        };

        dialog.showMessageBox(dialogOpts).then(() => reject(error));
      });

      autoUpdater.on('update-available', () => {
        this.sendUpdate('Finalizing');
      });

      autoUpdater.on('update-downloaded', () => {
        this.sendUpdate('Awaiting restart');
        const dialogOpts = {
          type: 'info',
          buttons: ['Restart'],
          title: 'Application Update',
          message: 'Update downloaded',
          detail: 'In order to use the app with the latest update, please restart the application now.',
        };

        dialog.showMessageBox(dialogOpts).then(() => {
          autoUpdater.quitAndInstall();
          resolve();
        });
      });

      autoUpdater.on('update-not-available', () => {
        this.sendUpdate('Update not available');
        resolve();
      });

      autoUpdater.setFeedURL({ url: this.tempDir });
      autoUpdater.checkForUpdates();
    });
  };
}
