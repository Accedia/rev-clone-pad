import { app, BrowserWindow, ipcMain } from "electron";
import WindowManager from "./utils/window_manager";
import { readJson } from "./utils/read_json";
import importer from "./utils/importer";
import { MESSAGE } from "./constants/messages";
import path from 'path';
import axios from 'axios';

interface StartImporterData {
  path: string;
  waitTime: string;
}

const CUSTOM_PROTOCOL = 'ccc';
class Main {
  windowManager = new WindowManager();

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
      app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL);
    }

    // Force single application instance
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
    } else {
      app.on('second-instance', (e, argv) => {
        if (process.platform !== 'darwin') {
          // Find the arg that is our custom protocol url and store it
          const customProtocolPrefix = `${CUSTOM_PROTOCOL}://`;
          let url = argv.find((arg) => arg.startsWith(customProtocolPrefix));
          url = url.replace(customProtocolPrefix, '');
          this.fetchData(url);
        }

        if (this.windowManager.mainWindow) {
          if (this.windowManager.mainWindow.isMinimized()) this.windowManager.mainWindow.restore();
          this.windowManager.mainWindow.focus();
        }
      });
    }

    this.registerMainListeners();
  }

  private registerMainListeners = () => {
    ipcMain.on(MESSAGE.START_IMPORTER, this.startImporter);
    ipcMain.on(MESSAGE.STOP_IMPORTER, importer.stop);
    ipcMain.on(MESSAGE.CLOSE_POPUP, this.windowManager.closePopupWindow);
  };

  private startImporter = async (event: any, data: StartImporterData) => {
    const { path, waitTime } = data;
    importer.start();

    const jsonParse = await readJson(path);
    if (jsonParse.success) {
      this.windowManager.createPopupWindow();
      await importer.startPopulation(
        jsonParse.data,
        this.windowManager.popupWindow,
        waitTime
      );
    } else {
      this.windowManager.mainWindow.webContents.send(
        MESSAGE.ERROR_JSON,
        jsonParse.data
      );
    }
  };

  private fetchData = async (url: string) => {
    try {
      url = url.replace('localhost', '[::1]');

      console.log('url', url);
      const result = await axios.get(url);

      console.log('result.data', result.data);
    } catch (e) {
      console.log('Error retrieving the forgettables', e);
    }
    
  };
}

const main = new Main();
