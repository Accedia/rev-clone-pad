import { app, ipcMain } from 'electron';
import { resolve } from 'path';
import { Channel } from './shared/enums';
import { APP_PROTOCOL } from './shared/constants';
import WindowManager from './utils/window-manager';
import { resolveProtocolUrl } from './utils/protocol-helper';

if (require('electron-squirrel-startup')) {
  app.quit();
}

class Main {
  windowManager: WindowManager;

  constructor() {
    app.on('ready', () => {
      this.windowManager = new WindowManager();
      this.windowManager.showMainWindow();
    });

    this.registerListeners();
    this.registerProtocol();
    this.ensureSingleInstanceLock();
  }

  private registerProtocol(): void {
    app.removeAsDefaultProtocolClient(APP_PROTOCOL);

    if (app.isPackaged) {
      app.setAsDefaultProtocolClient(APP_PROTOCOL);
    } else {
      app.setAsDefaultProtocolClient(APP_PROTOCOL, process.execPath, [resolve(process.argv[1])]);
    }
  }

  private ensureSingleInstanceLock(): void {
    if (!app.requestSingleInstanceLock()) {
      app.quit();
    } else {
      app.on('second-instance', async (e, argv) => {
        if (this.windowManager.mainWindow) {
          this.windowManager.focusMainWindow();
        } else {
          this.windowManager.showMainWindow();
        }

        const forgettableJson = resolveProtocolUrl(argv);
        this.windowManager.sendForgettableData(forgettableJson);
      })
    }
  }

  private registerListeners(): void {
    ipcMain.on(Channel.AppClosed, () => app.quit());
    ipcMain.on(Channel.UpdateAccepted, () => this.windowManager.showUpdateWindow());
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }
}

const main = new Main();
export const windowManager = main.windowManager;
export const appInstance = app;
