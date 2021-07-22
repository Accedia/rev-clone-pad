import { isDev } from "./is_dev";
import {
  BrowserWindow,
  screen,
  BrowserWindowConstructorOptions,
} from "electron";
import * as path from "path";
import importer from "./importer";
import { snooze } from "./snooze";

type MaybeBrowserWindow = BrowserWindow | null;
interface WindowConfig {
  main: BrowserWindowConstructorOptions;
  popup: (displayWidth: number) => BrowserWindowConstructorOptions;
  loading: BrowserWindowConstructorOptions;
}

const windowConfig: WindowConfig = {
  main: {
    title: "FIT CCC Automation",
    icon: path.resolve(__dirname, "../../icon.ico"),
    height: 450,
    width: 390,
    autoHideMenuBar: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  },
  popup: (displayWidth: number) => ({
    width: 400,
    height: 160,
    x: displayWidth - 450,
    y: 50,
    title: "FIT CCC Automation",
    icon: path.resolve(__dirname, "../icon.ico"),
    alwaysOnTop: true,
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
    title: "FIT CCC Automation",
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
    this.loadingWindow.once("show", this.createMainWindow);
    if (isDev()) {
      this.loadingWindow.loadURL(`${this.devUrl}#${this.paths.loading}`);
    } else {
      this.loadingWindow.loadFile(this.prodUrl, {
        hash: this.paths.loading,
      });
    }
    this.loadingWindow.show();
  };

  createMainWindow = (): void => {
    snooze(5000).then(() => {
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
    });
  };

  createPopupWindow = (): void => {
    const display = screen.getPrimaryDisplay();
    const popupConfig = windowConfig.popup(display.bounds.width);
    this.popupWindow = new BrowserWindow(popupConfig);
    this.popupWindow.on("close", this.listenerPopupOnClose);
    this.popupWindow.on("ready-to-show", () => this.popupWindow.show());
    this.mainWindow.minimize();
    if (isDev()) {
      this.popupWindow.loadURL(`${this.devUrl}#${this.paths.controls}`);
    } else {
      this.popupWindow.loadFile(this.prodUrl, {
        hash: this.paths.controls,
      });
    }
  };

  closePopupWindow = async (): Promise<void> => {
    importer.stop();
    this.popupWindow.close();
  };

  private listenerPopupOnClose = async () => {
    if (importer.isRunning) {
      importer.stop();
      await snooze(500);
    }
    await snooze(500);
    this.popupWindow = null;
    this.mainWindow.restore();
  };
}

export default WindowManager;
