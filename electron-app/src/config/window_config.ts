import { BrowserWindowConstructorOptions } from 'electron';
import * as path from 'path';
import { isDev } from '../utils/is_dev';

type CommonConfigOptions = Partial<BrowserWindowConstructorOptions>;

interface WindowConfig {
  main: BrowserWindowConstructorOptions;
  loading: BrowserWindowConstructorOptions;
  blockOverlay: BrowserWindowConstructorOptions;
  manual: BrowserWindowConstructorOptions;
}

const COMMON_CONFIG: CommonConfigOptions = {
  title: 'Force Import Technology',
  icon: path.resolve(__dirname, '../../assets/icon-white-bg.ico'),
  autoHideMenuBar: true,
  show: false,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    enableRemoteModule: true,
  },
};

export const WINDOW_CONFIG: WindowConfig = {
  main: {
    ...COMMON_CONFIG,
    height: 225,
    width: 400,
    resizable: true,
  },
  loading: {
    ...COMMON_CONFIG,
    width: 250,
    height: 300,
    frame: false,
    backgroundColor: '#ffffff',
  },
  blockOverlay: {
    ...COMMON_CONFIG,
    opacity: 0.4,
    frame: false,
    focusable: false,
    backgroundColor: '#000000',
  },
  manual: {
    ...COMMON_CONFIG,
    width: 600,
    height: 800,
    webPreferences: {
      ...COMMON_CONFIG.webPreferences,
      webSecurity: false,
      devTools: isDev(),
    },
  },
};
