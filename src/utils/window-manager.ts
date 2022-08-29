import { BrowserWindow } from 'electron';
import path from 'path';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;
declare const LOADING_WEBPACK_ENTRY: string;
// declare const LOADING_PRELOAD_WEBPACK_ENTRY: string;

class WindowManager {
  loadingWindow: BrowserWindow | null;
  mainWindow: BrowserWindow | null;

  constructor() {
    this.loadingWindow = null;
    this.mainWindow = null;
  }

  public async showLoadingWindow(): Promise<void> {
    this.loadingWindow = new BrowserWindow({
      title: 'REV Clone Pad',
      icon: path.resolve(__dirname, '../../assets/icon-white-bg.ico'),
      autoHideMenuBar: true,
      height: 400,
      width: 400,
      webPreferences: {
        nodeIntegration: true,
        //preload: LOADING_PRELOAD_WEBPACK_ENTRY,
      },
    });

    await this.loadingWindow.loadURL(LOADING_WEBPACK_ENTRY);
    setTimeout(() => this.showMainWindow(), 2000);
  }

  public async showMainWindow(): Promise<void> {
    if (this.loadingWindow) {
      this.loadingWindow.close();
    }

    this.mainWindow = new BrowserWindow({
      title: 'REV Clone Pad',
      icon: path.resolve(__dirname, '../../assets/icon-white-bg.ico'),
      autoHideMenuBar: true,
      height: 400,
      width: 400,
      webPreferences: {
        nodeIntegration: true,
        preload: MAIN_PRELOAD_WEBPACK_ENTRY,
      },
    });

    await this.mainWindow.loadURL(MAIN_WEBPACK_ENTRY);
  }
}

export default WindowManager;
