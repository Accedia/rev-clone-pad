import { ResponseData } from './interfaces/ResponseData';
import { app, globalShortcut, ipcMain } from 'electron';
import WindowManager from './utils/window_manager';
import importer from './utils/importer';
import { MESSAGE } from './constants/messages';
import path from 'path';
import axios from 'axios';
import { CUSTOM_PROTOCOL } from './constants/config';
import Store from 'electron-store';
import { InputSpeed } from './interfaces/InputSpeed';
import { getCustomProtocolUrl } from './utils/get_custom_protocol_url';
import { isAppDev, isDev } from './utils/is_dev';
import log from 'electron-log';

const INPUT_SPEED_STORAGE_KEY = 'inputSpeed';

if (isDev() && isAppDev(app)) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('source-map-support').install();
}

if (require('electron-squirrel-startup')) app.quit();

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
          /**
           * Enters here when app is opened from the browser
           * after it has been started manually before that
           */
          importer.stop();
          this.windowManager.mainWindow.webContents.send(MESSAGE.RESET_CONTROLS_STATE);
        } else if (url) {
          /**
           * I don't know when we enter here
           */
          log.debug('It seems we need this');
          await this.windowManager.createMainWindow();
        }

        if (url) {
          // ? Is this snooze necessary, check if it causes problems
          // await snooze(1500);
          this.fetchDataAndStartImporter(url);
        }
      });
    }
  };

  private registerMainListeners = () => {
    ipcMain.on(MESSAGE.STOP_IMPORTER, importer.stop);
    ipcMain.on(MESSAGE.SET_INPUT_SPEED, this.setInputSpeed);
    ipcMain.on(MESSAGE.CLOSE_APP, app.quit);
    ipcMain.on(MESSAGE.OPEN_MANUAL, this.windowManager.openManual);
  };

  private registerKeyboardShortcuts = () => {
    app.whenReady().then(() => {
      globalShortcut.register('F7', () => {
        importer.stop();
        this.windowManager.mainWindow.webContents.send(MESSAGE.STOP_IMPORTER_SHORTCUT);
      });
    });
  };

  private setInputSpeed = (event: any, inputSpeed: string) => {
    this.store.set(INPUT_SPEED_STORAGE_KEY, inputSpeed);
  };

  public getInputSpeed = (): InputSpeed => {
    return 'extra-slow';
    // return this.store.get(INPUT_SPEED_STORAGE_KEY) as InputSpeed;
  };

  public fetchDataAndStartImporter = async (url: string) => {
    try {
      this.updateMainWindowStateToFetching();
      url = url.replace('localhost', '[::1]');
      const { data } = await axios.get<ResponseData>(url);

      await importer.startPopulation(data, this.windowManager.mainWindow);

      const urlOrigin = url.substring(0, url.indexOf('api'));
      const finishAutomationUrl = `${urlOrigin}/api/finishAutomation/${data.automationId}`;
      await axios.post<ResponseData>(finishAutomationUrl);
    } catch (e) {
      log.error('Error retrieving the forgettables', e.message);
      this.windowManager.mainWindow.webContents.send(MESSAGE.ERROR, `Error: ${e.message}`);
    }
  };

  private updateMainWindowStateToFetching = () => {
    this.windowManager.appStateUpdate('populating');
    this.windowManager.putWindowOnTop(this.windowManager.mainWindow);
    this.windowManager.mainWindow.webContents.send(MESSAGE.LOADING_UPDATE, true);
  };
}

const main = new Main();

export const getInputSpeed = main.getInputSpeed;
export const fetchDataAndStartImporter = main.fetchDataAndStartImporter;
export const mainWindowManager = main.windowManager;
