import { isDev } from "./is_dev";
import {
  BrowserWindow,
  screen,
  BrowserWindowConstructorOptions,
} from "electron";
import * as path from "path";
import importer from "./importer";
import { snooze } from "./snooze";
import { CLOSE_POPUP_WAIT_TIME } from '../constants/config';
import { getCustomProtocolUrl } from './get_custom_protocol_url';
import { fetchData } from '../main';

type MaybeBrowserWindow = BrowserWindow | null;
interface WindowConfig {
  main: BrowserWindowConstructorOptions;
  popup: (displayWidth: number) => BrowserWindowConstructorOptions;
  loading: BrowserWindowConstructorOptions;
}

const windowConfig: WindowConfig = {
  main: {
    title: "FIT Input CCC Automation",
    icon: path.resolve(__dirname, "../../icon.ico"),
    height: 450,
    width: 390,
    autoHideMenuBar: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  },
  popup: (displayWidth: number) => ({
    width: 400,
    height: 160,
    x: displayWidth - 450,
    y: 50,
    title: "FIT Input CCC Automation",
    icon: path.resolve(__dirname, "../icon.ico"),
    acceptFirstMouse: true,
    autoHideMenuBar: true,
    resizable: false,
    minimizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  }),
  loading: {
    title: "FIT Input CCC Automation",
    icon: path.resolve(__dirname, "../icon.ico"),
    width: 250,
    height: 300,
    show: false,
    frame: false,
    backgroundColor: "#ffffff",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  },
};

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
    this.loadingWindow = new BrowserWindow(windowConfig.loading);
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
    console.log('process.argv', process.argv);
    console.log('process.platform', process.platform);

    snooze(5000).then(async () => {
      this.createMainWindow();
      if (process.platform !== 'darwin') {
        const url = getCustomProtocolUrl(process.argv);

        console.log('url', url)

        if (url) {
          await this.createPopupWindow();
          fetchData(url);
        }
      }
    });
  };

  createMainWindow = (): void => {
    this.mainWindow = new BrowserWindow(windowConfig.main);
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow.show();
      this.loadingWindow.hide();
      this.loadingWindow.close();
    });
    if (isDev()) {
      this.mainWindow.loadURL(this.devUrl);
    } else {
      this.mainWindow.loadFile(this.prodUrl);
    }
  };

  createPopupWindow = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const display = screen.getPrimaryDisplay();
      const popupConfig = windowConfig.popup(display.bounds.width);
      this.popupWindow = new BrowserWindow(popupConfig);
      this.popupWindow.setAlwaysOnTop(true, 'pop-up-menu');
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
