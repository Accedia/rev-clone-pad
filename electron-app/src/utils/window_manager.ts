import { isDev } from "./is_dev";
import { BrowserWindow, screen } from "electron";
import * as path from "path";
import { snooze } from "./snooze";
import { getCustomProtocolUrl } from "./get_custom_protocol_url";
import { fetchData } from "../main";
import { WINDOW_CONFIG } from "../config/window_config";
import { MESSAGE, APP_STATE } from "../constants/messages";

type MaybeBrowserWindow = BrowserWindow | null;

class WindowManager {
  mainWindow: MaybeBrowserWindow;
  loadingWindow: MaybeBrowserWindow;

  private devUrl = "http://localhost:3000";
  private prodUrl = path.resolve(__dirname, "../../build/index.html");
  private paths = {
    controls: "/controls",
    loading: "/loading",
  };

  constructor() {
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

  public putWindowOnTop = (window: BrowserWindow): void => {
    const display = screen.getPrimaryDisplay();
    const [windowWidth] = window.getSize();

    window.setAlwaysOnTop(true);
    window.setPosition(display.bounds.width - windowWidth - 20, 20);
  };

  public appStateUpdate = (newState: keyof typeof APP_STATE): void => {
    this.mainWindow.webContents.send(MESSAGE.UPDATE_APP_STATE, newState);
  };
}

export default WindowManager;
