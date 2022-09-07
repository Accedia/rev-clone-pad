import { app, BrowserWindow } from 'electron';
import AppUpdater from './app-updater';
import {
  UPDATE_SCREEN_CONFIG,
  MAIN_SCREEN_CONFIG,
  withPreload,
} from '../shared/config/screen-config';
import { Channel } from '../shared/enums';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;
declare const UPDATE_WEBPACK_ENTRY: string;
declare const UPDATE_PRELOAD_WEBPACK_ENTRY: string;

class WindowManager {
  private appUpdater: AppUpdater;
  updateWindow: BrowserWindow | null;
  mainWindow: BrowserWindow | null;

  constructor() {
    this.appUpdater = new AppUpdater();
    this.updateWindow = null;
    this.mainWindow = null;
  }

  public async showMainWindow(): Promise<void> {
    const screenConfig = withPreload(MAIN_SCREEN_CONFIG, MAIN_PRELOAD_WEBPACK_ENTRY);
    this.mainWindow = new BrowserWindow(screenConfig);
    await this.mainWindow.loadURL(MAIN_WEBPACK_ENTRY);

    this.mainWindow.once('ready-to-show', async () => {
      this.mainWindow.webContents.send(Channel.VersionUpdated, app.getVersion());
      this.showAndFocus(this.mainWindow);
      
      await this.appUpdater.checkForUpdates(this.mainWindow);
    });
  }

  public async showUpdateWindow(): Promise<void> {
    if (this.mainWindow) {
      this.mainWindow.close();
    }
    
    const screenConfig = withPreload(UPDATE_SCREEN_CONFIG, UPDATE_PRELOAD_WEBPACK_ENTRY);
    this.updateWindow = new BrowserWindow(screenConfig);
    await this.updateWindow.loadURL(UPDATE_WEBPACK_ENTRY);

    this.updateWindow.once('ready-to-show', async () => {
      this.showAndFocus(this.updateWindow);
      
      if (app.isPackaged) {
        this.appUpdater.downloadAndInstallUpdates(this.updateWindow);
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
