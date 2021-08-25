import { app, globalShortcut, ipcMain } from 'electron';
import WindowManager from './utils/window_manager';
import importer from './utils/importer';
import { MESSAGE } from './constants/messages';
import path from 'path';
import axios from 'axios';
import { Forgettable } from './interfaces/Forgettable';
import { snooze } from './utils/snooze';
import { CUSTOM_PROTOCOL } from './constants/config';
import Store from 'electron-store';
import { WaitTime } from './interfaces/WaitTime';
import { InputSpeed } from './interfaces/InputSpeed';
import { getCustomProtocolUrl } from './utils/get_custom_protocol_url';
import { getPopulationData } from './utils/get_population_data';
import { isAppDev, isDev } from './utils/is_dev';
import { setupAutoUpdater } from './utils/auto_updater';

const WAIT_TIME_STORAGE_KEY = 'waitTime';
const INPUT_SPEED_STORAGE_KEY = 'inputSpeed';

if (require('electron-squirrel-startup')) app.quit();

if (!isAppDev(app) && !isDev()) {
  setupAutoUpdater();
}

class Main {
  windowManager = new WindowManager();
  store = new Store();

  constructor() {
    app.on('ready', this.windowManager.startLoading);

    this.registerCustomProtocol();
    this.createSingleInstanceLock();
    this.registerMainListeners();
    this.registerKeyboardShortcuts();
  }

  private registerCustomProtocol = () => {
    app.removeAsDefaultProtocolClient(CUSTOM_PROTOCOL);

    // The extra two parameters are required for windows development version
    if (isAppDev(app) && process.platform === 'win32') {
      app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
    } else {
      app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL);
    }
  };

  private createSingleInstanceLock = () => {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
    } else {
      app.on('second-instance', async (e, argv) => {
        const url = getCustomProtocolUrl(argv);

        if (this.windowManager.mainWindow) {
          importer.stop();
          this.windowManager.mainWindow.webContents.send(MESSAGE.RESET_CONTROLS_STATE);
        } else if (url) {
          await this.windowManager.createMainWindow();
        }

        if (url) {
          this.windowManager.appStateUpdate('populating');
          this.windowManager.putWindowOnTop(this.windowManager.mainWindow);
          this.windowManager.mainWindow.webContents.send(MESSAGE.LOADING_UPDATE, true);
          await snooze(1500);
          this.fetchData(url);
        }
      });
    }
  };

  private registerMainListeners = () => {
    ipcMain.on(MESSAGE.STOP_IMPORTER, importer.stop);
    ipcMain.on(MESSAGE.SET_WAIT_TIME, this.setWaitTime);
    ipcMain.on(MESSAGE.SET_INPUT_SPEED, this.setInputSpeed);
  };

  private registerKeyboardShortcuts = () => {
    app.whenReady().then(() => {
      globalShortcut.register('F10', () => {
        importer.stop();
        this.windowManager.mainWindow.webContents.send(MESSAGE.STOP_IMPORTER_SHORTCUT);
      });
    });
  };

  private setWaitTime = (event: any, waitTime: string) => {
    this.store.set(WAIT_TIME_STORAGE_KEY, waitTime);
  };

  private setInputSpeed = (event: any, inputSpeed: string) => {
    this.store.set(INPUT_SPEED_STORAGE_KEY, inputSpeed);
  };

  getWaitTime = (): WaitTime => {
    return this.store.get(WAIT_TIME_STORAGE_KEY) as WaitTime;
  };

  getInputSpeed = (): InputSpeed => {
    return this.store.get(INPUT_SPEED_STORAGE_KEY) as InputSpeed;
  };

  private startImporter = async (forgettables: Forgettable[]) => {
    const data = getPopulationData(forgettables);

    await importer.startPopulation(data, forgettables, this.windowManager.mainWindow);
  };

  fetchData = async (url: string) => {
    try {
      url = url.replace('localhost', '[::1]');
      const result = await axios.get(url);

      await this.startImporter(result.data);
    } catch (e) {
      console.log('Error retrieving the forgettables', e.message);
      this.windowManager.mainWindow.webContents.send(MESSAGE.ERROR, `Error: ${e.message}`);
    }
  };
}

const main = new Main();

export const getWaitTime = main.getWaitTime;
export const getInputSpeed = main.getInputSpeed;
export const fetchData = main.fetchData;
