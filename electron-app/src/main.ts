import { app, BrowserWindow, ipcMain } from "electron";
import WindowManager from "./utils/window_manager";
import importer from "./utils/importer";
import { MESSAGE } from "./constants/messages";
import path from "path";
import axios from "axios";
import { Forgettable } from "./interfaces/Forgettable";
import { snooze } from "./utils/snooze";
import { CUSTOM_PROTOCOL } from "./constants/config";
import Store from "electron-store";
import { WaitTime } from "./interfaces/WaitTime";
import { InputSpeed } from "./interfaces/InputSpeed";
import { getCustomProtocolUrl } from "./utils/get_custom_protocol_url";
import { getPopulationData } from "./utils/get_population_data";
import { isAppDev } from "./utils/is_dev";

const WAIT_TIME_STORAGE_KEY = "waitTime";
const INPUT_SPEED_STORAGE_KEY = "inputSpeed";

class Main {
  windowManager = new WindowManager();
  store = new Store();

  constructor() {
    app.on("ready", this.windowManager.startLoading);

    this.registerCustomProtocol();
    this.createSingleInstanceLock();
    this.registerMainListeners();
  }

  private registerCustomProtocol = () => {
    app.removeAsDefaultProtocolClient(CUSTOM_PROTOCOL);

    // The extra two parameters are required for windows development version
    if (isAppDev(app) && process.platform === "win32") {
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
      app.on("second-instance", async (e, argv) => {
        const url = getCustomProtocolUrl(argv);

        if (this.windowManager.popupWindow) {
          importer.stop();
          this.windowManager.popupWindow.webContents.send(MESSAGE.RESET_CONTROLS_STATE);
        } else if (url) {
          await this.windowManager.createPopupWindow();
        }

        if (url) {
          await snooze(1500);
          this.fetchData(url);
        }
      });
    }
  };

  private registerMainListeners = () => {
    ipcMain.on(MESSAGE.STOP_IMPORTER, importer.stop);
    ipcMain.on(MESSAGE.CLOSE_POPUP, this.windowManager.closePopupWindow);
    ipcMain.on(MESSAGE.SET_WAIT_TIME, this.setWaitTime);
    ipcMain.on(MESSAGE.SET_INPUT_SPEED, this.setInputSpeed);
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

    await importer.startPopulation(data, this.windowManager.popupWindow);
  };

  fetchData = async (url: string) => {
    try {
      this.windowManager.popupWindow.webContents.send(MESSAGE.LOADING_UPDATE, true);
      url = url.replace("localhost", "[::1]");
      const result = await axios.get(url);

      this.windowManager.popupWindow.webContents.send(MESSAGE.LOADING_UPDATE, false);
      this.startImporter(result.data);
    } catch (e) {
      console.log("Error retrieving the forgettables", e.message);
      this.windowManager.popupWindow.webContents.send(MESSAGE.ERROR, `Error: ${e.message}`);
    }
  };
}

const main = new Main();

export const getWaitTime = main.getWaitTime;
export const getInputSpeed = main.getInputSpeed;
export const fetchData = main.fetchData;
