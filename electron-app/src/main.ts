import { app, BrowserWindow, ipcMain } from "electron";
import WindowManager from "./utils/window_manager";
import { readJson } from "./utils/read_json";
import importer from "./utils/importer";
import { MESSAGE } from "./constants/messages";

interface StartImporterData {
  path: string;
  waitTime: string;
}

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
}

const main = new Main();
