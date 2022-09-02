import path from 'path';
import { BrowserWindowConstructorOptions } from 'electron';

const BASE_SCREEN_CONFIG: BrowserWindowConstructorOptions = {
  title: 'REV Clone Pad',
  icon: path.resolve(__dirname, '../../assets/icon-white-bg.ico'),
  autoHideMenuBar: true,
  show: false,
  resizable: false,
  alwaysOnTop: true,
  webPreferences: {
    nodeIntegration: true,
  },
};

export const UPDATE_SCREEN_CONFIG: BrowserWindowConstructorOptions = {
  ...BASE_SCREEN_CONFIG,
  height: 71,
  width: 250,
  titleBarStyle: 'hidden',
};

export const MAIN_SCREEN_CONFIG: BrowserWindowConstructorOptions = {
  ...BASE_SCREEN_CONFIG,
  height: 599,
  width: 500,
};

export const withPreload = (
  options: BrowserWindowConstructorOptions,
  preloadPath: string
): BrowserWindowConstructorOptions => {
  return {
    ...options,
    webPreferences: {
      ...options.webPreferences,
      preload: preloadPath
    }
  }
};
