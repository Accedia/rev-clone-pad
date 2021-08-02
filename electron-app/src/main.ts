import { app, BrowserWindow, ipcMain } from "electron";
import WindowManager from "./utils/window_manager";
import importer from "./utils/importer";
import { MESSAGE } from "./constants/messages";
import path from 'path';
import axios from 'axios';
import { Forgettable } from './interfaces/Forgettable';
import { snooze } from './utils/snooze';
import { CLOSE_POPUP_WAIT_TIME, CUSTOM_PROTOCOL } from './constants/config';
import Store from 'electron-store';
import { WaitTime } from './interfaces/WaitTime';
import { InputSpeed } from './interfaces/InputSpeed';
import { getCustomProtocolUrl } from './utils/get_custom_protocol_url';

const WAIT_TIME_STORAGE_KEY = "waitTime";
const INPUT_SPEED_STORAGE_KEY = "inputSpeed";

// TODO remove and make the data arrive in the proper format from FIT
const REPL = 'Repl';
const RPR = 'Rpr';
const REFN = 'Refn';
const R_I = 'R_I';
const SECT = 'Sect';
const ALIGN = 'Align';
const SUBL = 'Subl';
const BLND = 'Blnd';
const PDR = 'PDR';
const NONE = 'None';

const LINE_OPERATIONS = [
  { id: NONE, title: 'None', disabled: true },
  { id: REPL, title: 'Repl' },
  { id: RPR, title: 'Rpr' },
  { id: REFN, title: 'Refn' },
  { id: R_I, title: 'R&I' },
  { id: SECT, title: 'Sect' },
  { id: ALIGN, title: 'Align' },
  { id: SUBL, title: 'Subl' },
  { id: BLND, title: 'Blnd' },
  { id: PDR, title: 'PDR' },
];
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
        if (this.windowManager.popupWindow) {
          importer.stop();
          this.windowManager.popupWindow.webContents.send(
            MESSAGE.RESET_CONTROLS_STATE
          );
        } else {
          await this.windowManager.createPopupWindow();
        }

        if (process.platform !== 'darwin') {
          // Find the arg that is our custom protocol url and store it
          const url = getCustomProtocolUrl(argv);
          await snooze(1500);
          this.fetchData(url);
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

  private getToStringOrNull = (value: number) => {
    return value ? value.toString() : null;
  }

  // TODO refactor
  private startImporter = async (forgettables: Forgettable[]) => {
    const data = [];

    for (const forgettable of forgettables) {
      const oper = LINE_OPERATIONS.find((lo) => lo.id === forgettable.oper);
      const extPrice = ((forgettable.quantity || 0) * (forgettable.partPrice$ || 0)).toFixed(2);

      data.push([
        null,
        null,
        null,
        null,
        null,
        null,
        oper ? oper.title : null,
        null,
        forgettable.description,
        null,
        this.getToStringOrNull(forgettable.quantity),
        this.getToStringOrNull(forgettable.partPrice$),
        extPrice,
        null,
        null,
        this.getToStringOrNull(forgettable.laborHours),
        null,
        this.getToStringOrNull(forgettable.paintHours),
      ]);
    }

    console.log('data after', data);

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

      console.log('result.data', result.data);
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