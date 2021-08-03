import { app, BrowserWindow, ipcMain } from "electron";
import WindowManager from "./utils/window_manager";
import importer from "./utils/importer";
import { MESSAGE } from "./constants/messages";
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

const WAIT_TIME_STORAGE_KEY = "waitTime";
const INPUT_SPEED_STORAGE_KEY = "inputSpeed";
class Main {
  windowManager = new WindowManager();
  store = new Store();

  constructor() {
    app.on("ready", () => {
      this.windowManager.startLoading();

      app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
          this.windowManager.createMainWindow();
        }
      });
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on('open-url', function (event, url) {
      event.preventDefault();
      this.fetchData(url);
    });

    // remove so we can register each time as we run the app. 
    app.removeAsDefaultProtocolClient(CUSTOM_PROTOCOL);

    // If we are running a non-packaged version of the app && on windows
    if(process.env.NODE_ENV === 'development' && process.platform === 'win32') {
      // Set the path of electron.exe and your app.
      // These two additional parameters are only available on windows.
      app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);        
    } else {
      // TODO SWITCH!!!!!!!!
      app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);        
      // app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL);
    }

    // Force single application instance
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
    } else {
      app.on('second-instance', async (e, argv) => {
        if (process.platform !== 'darwin') {
          if (this.windowManager.popupWindow) {
            importer.stop();
            this.windowManager.popupWindow.webContents.send(
              MESSAGE.RESET_CONTROLS_STATE
            );
          } else {
            // Find the arg that is our custom protocol url and store it
            const url = getCustomProtocolUrl(argv);
            if (url) {
              await this.windowManager.createPopupWindow();
              await snooze(1500);
              this.fetchData(url);
            }
            
          }
        }
      });
    }

    this.registerMainListeners();
  }

  private registerMainListeners = () => {
    ipcMain.on(MESSAGE.STOP_IMPORTER, importer.stop);
    ipcMain.on(MESSAGE.CLOSE_POPUP, this.windowManager.closePopupWindow);
    ipcMain.on(MESSAGE.SET_WAIT_TIME, this.setWaitTime);
    ipcMain.on(MESSAGE.SET_INPUT_SPEED, this.setInputSpeed);
  };

  private setWaitTime = (event: any, waitTime: string) => {
    this.store.set(WAIT_TIME_STORAGE_KEY, waitTime);
  }

  private setInputSpeed = (event: any, inputSpeed: string) => {
    this.store.set(INPUT_SPEED_STORAGE_KEY, inputSpeed);
  }

  getWaitTime = (): WaitTime => {
    return this.store.get(WAIT_TIME_STORAGE_KEY) as WaitTime;
  }

  getInputSpeed = (): InputSpeed => {
    return this.store.get(INPUT_SPEED_STORAGE_KEY) as InputSpeed;
  }

  private startImporter = async (forgettables: Forgettable[]) => {
    const data = getPopulationData(forgettables);

    await importer.startPopulation(
      data,
      this.windowManager.popupWindow
    );
  };

  fetchData = async (url: string) => {
    try {
      this.windowManager.popupWindow.webContents.send(
        MESSAGE.LOADING_UPDATE,
        true
      );
      url = url.replace('localhost', '[::1]');
      const result = await axios.get(url);

      this.windowManager.popupWindow.webContents.send(
        MESSAGE.LOADING_UPDATE,
        false
      );
      this.startImporter(result.data);
    } catch (e) {
      console.log('Error retrieving the forgettables', e.message);
      this.windowManager.popupWindow.webContents.send(
        MESSAGE.ERROR,
        `Error: ${e.message}`
      );
    }
    
  };
}

const main = new Main();

export const getWaitTime = main.getWaitTime;
export const getInputSpeed = main.getInputSpeed;
export const fetchData = main.fetchData;