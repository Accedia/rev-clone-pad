import { BrowserWindowConstructorOptions, screen } from "electron";
import * as path from "path";

type CommonConfigOptions = Partial<BrowserWindowConstructorOptions>;

interface WindowConfig {
  main: BrowserWindowConstructorOptions;
  popup: () => BrowserWindowConstructorOptions;
  loading: BrowserWindowConstructorOptions;
}

const COMMON_CONFIG: CommonConfigOptions = {
  title: "FIT Input CCC Automation",
  icon: path.resolve(__dirname, "../../icon.ico"),
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
    height: 450,
    width: 390,
    resizable: false,
  },
  popup: () => ({
    ...COMMON_CONFIG,
    width: 400,
    height: 160,
    x: screen.getPrimaryDisplay().bounds.width - 450,
    y: 50,
    acceptFirstMouse: true,
    resizable: false,
    minimizable: false,
  }),
  loading: {
    ...COMMON_CONFIG,
    width: 250,
    height: 300,
    frame: false,
    backgroundColor: "#ffffff",
  },
};
