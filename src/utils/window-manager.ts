import { app, BrowserWindow } from 'electron';
import AutoUpdater from './auto-updater';
import AutoUpdater2 from './auto-updater-2';
import {
  LOADING_SCREEN_CONFIG,
  MAIN_SCREEN_CONFIG,
  withPreload,
} from '../shared/config/screen-config';
import { Channel } from '../shared/enums';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;
declare const LOADING_WEBPACK_ENTRY: string;
declare const LOADING_PRELOAD_WEBPACK_ENTRY: string;

class WindowManager {
  private autoUpdater: AutoUpdater2;
  loadingWindow: BrowserWindow | null;
  mainWindow: BrowserWindow | null;

  constructor() {
    this.autoUpdater = new AutoUpdater2();
    this.loadingWindow = null;
    this.mainWindow = null;
  }

  public async showLoadingWindow(): Promise<void> {
    const screenConfig = withPreload(LOADING_SCREEN_CONFIG, LOADING_PRELOAD_WEBPACK_ENTRY);
    this.loadingWindow = new BrowserWindow(screenConfig);
    await this.loadingWindow.loadURL(LOADING_WEBPACK_ENTRY);

    this.loadingWindow.once('ready-to-show', async () => {
      this.showAndFocus(this.loadingWindow);

      if (app.isPackaged) {
        const autoUpdater = new AutoUpdater(this.loadingWindow);
        await autoUpdater.checkForUpdates();
      }

      this.loadingWindow.close();
      this.showMainWindow();
    });
  }

  public async showMainWindow(): Promise<void> {
    const screenConfig = withPreload(MAIN_SCREEN_CONFIG, MAIN_PRELOAD_WEBPACK_ENTRY);
    this.mainWindow = new BrowserWindow(screenConfig);
    await this.mainWindow.loadURL(MAIN_WEBPACK_ENTRY);

    this.mainWindow.once('ready-to-show', async () => {
      this.mainWindow.webContents.send(Channel.VersionUpdated, app.getVersion());
      this.showAndFocus(this.mainWindow);
      
      await this.autoUpdater.checkForUpdates(this.mainWindow);
    });
  }

  public async showUpdateWindow(): Promise<void> {
    if (this.mainWindow) {
      this.mainWindow.close();
    }

    // TODO: Change naming and props
    const screenConfig = withPreload(LOADING_SCREEN_CONFIG, LOADING_PRELOAD_WEBPACK_ENTRY);
    this.loadingWindow = new BrowserWindow(screenConfig);
    await this.loadingWindow.loadURL(LOADING_WEBPACK_ENTRY);

    this.loadingWindow.once('ready-to-show', async () => {
      this.showAndFocus(this.loadingWindow);
      
      if (app.isPackaged) {
        this.autoUpdater.downloadAndInstallUpdates(this.loadingWindow);
      }
    });
  }
  
  public sendForgettableData(json: string): void {
    const forgettable = JSON.parse(json);
    this.mainWindow.webContents.send(Channel.ForgettableCloned, forgettable);
  }

  public focusMainWindow(): void {
    if (!this.mainWindow) return;
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
    }

    this.mainWindow.focus();
  }

  private showAndFocus(window: BrowserWindow): void {
    window.show();
    window.focus();
  }
}

export default WindowManager;
