import { isAppDev, isDev } from './is_dev';
import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { getCustomProtocolUrl } from './get_custom_protocol_url';
import { fetchDataAndStartImporter } from '../main';
import { WINDOW_CONFIG } from '../config/window_config';
import { MESSAGE, APP_STATE } from '../constants/messages';
import { AutoUpdater } from './auto_updater';
import { getScreenSize } from './screen_size';

type MaybeBrowserWindow = BrowserWindow | null;

class WindowManager {
  mainWindow: MaybeBrowserWindow;
  loadingWindow: MaybeBrowserWindow;
  overlayWindow: MaybeBrowserWindow;

  private devUrl = 'http://localhost:3000';
  private prodUrl = path.resolve(__dirname, '../../build/index.html');
  private paths = {
    controls: '/controls',
    loading: '/loading',
    blockOverlay: '/block-overlay',
  };

  constructor() {
    this.mainWindow = null;
    this.loadingWindow = null;
  }

  private loadContent = (window: BrowserWindow, path?: string) => {
    if (isDev()) {
      let url = this.devUrl;
      if (path) {
        url += `#${path}`;
      }

      window.loadURL(url);
    } else {
      const options: Electron.LoadFileOptions = {};
      if (path) {
        options.hash = path;
      }

      window.loadFile(this.prodUrl, options);
    }
  };

  private loadLoadingWindowContent = () => {
    if (isDev()) {
      this.loadingWindow.loadURL(`${this.devUrl}#${this.paths.loading}`);
    } else {
      this.loadingWindow.loadFile(this.prodUrl, {
        hash: this.paths.loading,
      });
    }
  };

  public startLoading = (): void => {
    this.loadingWindow = new BrowserWindow(WINDOW_CONFIG.loading);
    this.loadLoadingWindowContent();
    this.loadingWindow.once('show', async () => {
      if (!isAppDev(app) && !isDev()) {
        const autoUpdater = new AutoUpdater(this.loadingWindow);
        await autoUpdater.checkAndDownloadUpdates();
      }

      await this.startApp();
    });
    this.loadingWindow.on('ready-to-show', this.loadingWindow.show);
  };

  public startApp = async (): Promise<void> => {
    await this.createMainWindow();
    if (process.platform !== 'darwin') {
      const url = getCustomProtocolUrl(process.argv);
      if (url) {
        /**
         * If the app has been opened by pressing the "Commit" button in REV
         * without the app being opened before that
         */
        await fetchDataAndStartImporter(url);
      }
    }
  };

  public createMainWindow = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.mainWindow = new BrowserWindow(WINDOW_CONFIG.main);
      this.mainWindow.once('ready-to-show', () => {
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

  public createBlockOVerlayWindow = (): void => {
    const { width, height } = getScreenSize();
    this.overlayWindow = new BrowserWindow({
      ...WINDOW_CONFIG.blockOverlay,
      width,
      height,
    });
    this.loadContent(this.overlayWindow, this.paths.blockOverlay);
    this.overlayWindow.on('ready-to-show', () => {
      this.overlayWindow.show();
      this.overlayWindow.setIgnoreMouseEvents(true);
      this.overlayWindow.moveTop();
    });
  };

  public destroyBlockOverlayWindow = (): void => {
    this.overlayWindow.close();
    this.overlayWindow = null;
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
