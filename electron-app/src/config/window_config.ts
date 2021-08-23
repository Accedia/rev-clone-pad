import { BrowserWindowConstructorOptions } from "electron";
import * as path from "path";

type CommonConfigOptions = Partial<BrowserWindowConstructorOptions>;

interface WindowConfig {
  main: BrowserWindowConstructorOptions;
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
    height: 435,
    width: 400,
    resizable: true,
  },
  loading: {
    ...COMMON_CONFIG,
    width: 250,
    height: 300,
    frame: false,
    backgroundColor: "#ffffff",
  },
};
