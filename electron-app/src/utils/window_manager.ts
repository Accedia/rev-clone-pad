import { isDev } from "./is_dev";
import { BrowserWindow } from "electron";
import * as path from "path";
import importer from "./importer";
import { snooze } from "./snooze";
import { CLOSE_POPUP_WAIT_TIME } from "../constants/config";
import { getCustomProtocolUrl } from "./get_custom_protocol_url";
import { fetchData } from "../main";
import { WINDOW_CONFIG } from "../config/window_config";

type MaybeBrowserWindow = BrowserWindow | null;

class WindowManager {
  mainWindow: MaybeBrowserWindow;
  popupWindow: MaybeBrowserWindow;
  loadingWindow: MaybeBrowserWindow;

  private devUrl = "http://localhost:3000";
  private prodUrl = path.resolve(__dirname, "../../build/index.html");
  private paths = {
    controls: "/controls",
    loading: "/loading",
  };

  constructor() {
    this.popupWindow = null;
    this.mainWindow = null;
    this.loadingWindow = null;
  }

  startLoading = (): void => {
    this.loadingWindow = new BrowserWindow(WINDOW_CONFIG.loading);
    this.loadingWindow.once("show", this.startApp);
    if (isDev()) {
      this.loadingWindow.loadURL(`${this.devUrl}#${this.paths.loading}`);
    } else {
      this.loadingWindow.loadFile(this.prodUrl, {
        hash: this.paths.loading,
      });
    }
    this.loadingWindow.show();
  };

  startApp = (): void => {
    snooze(5000).then(async () => {
      await this.createMainWindow();
      if (process.platform !== "darwin") {
        const url = getCustomProtocolUrl(process.argv);
        if (url) {
          await this.createPopupWindow();
          fetchData(url);
        }
      }
    });
  };

  createMainWindow = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.mainWindow = new BrowserWindow(WINDOW_CONFIG.main);
      this.mainWindow.once("ready-to-show", () => {
        this.mainWindow.show();
        this.loadingWindow.hide();
        this.loadingWindow.close();
        resolve();
      });
      if (isDev()) {
        this.mainWindow.loadURL(this.devUrl);
      } else {
        this.mainWindow.loadFile(this.prodUrl);
      }
    });
  };

  createPopupWindow = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.popupWindow = new BrowserWindow(WINDOW_CONFIG.popup());
      this.popupWindow.setAlwaysOnTop(true, "pop-up-menu");

      this.popupWindow.on("close", this.listenerPopupOnClose);
      this.popupWindow.on("ready-to-show", () => {
        this.popupWindow.show();
        this.popupWindow.blur();
        resolve();
      });

      this.mainWindow.minimize();

      if (isDev()) {
        this.popupWindow.loadURL(`${this.devUrl}#${this.paths.controls}`);
      } else {
        this.popupWindow.loadFile(this.prodUrl, {
          hash: this.paths.controls,
        });
      }
    });
  };

  closePopupWindow = async (): Promise<void> => {
    importer.stop();
    this.popupWindow.close();
  };

  private listenerPopupOnClose = async () => {
    if (importer.isRunning) {
      importer.stop();
      await snooze(CLOSE_POPUP_WAIT_TIME);
    }
    await snooze(CLOSE_POPUP_WAIT_TIME);
    this.popupWindow = null;
  };
}

export default WindowManager;
