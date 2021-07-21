import { app, BrowserWindow, ipcMain, screen, remote } from "electron";
import * as path from "path";
import { keyboard, Key } from "@nut-tree/nut-js";
import * as fs from "fs";

let mainWindow: BrowserWindow | null = null;
let popupWindow: BrowserWindow | null = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 450,
    width: 390,
    autoHideMenuBar: true,
    resizable: false,
    title: "FIT CCC Automation",
    icon: path.resolve(__dirname, "../icon.png"),

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  console.log("process.env.NODE_ENV", process.env.NODE_ENV);

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(`http://localhost:3000`);
  } else {
    mainWindow.loadFile(path.resolve(__dirname, "../build/index.html"));
    // and load the index.html of the app.
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

const getWaitTimeInSeconds = (waitTime: string) => {
  switch (waitTime) {
    case "extra-slow":
      return 20;
    case "slow":
      return 15;
    case "normal":
      return 10;
    case "fast":
      return 5;
    default:
      return 10;
  }
};

const createPopupWindow = () => {
  const display = screen.getPrimaryDisplay();
  popupWindow = new BrowserWindow({
    width: 400,
    height: 185,
    x: display.bounds.width - 450,
    y: 50,
    title: "FIT CCC Automation",
    icon: path.resolve(__dirname, "../icon.png"),
    alwaysOnTop: true,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  popupWindow.on("close", () => {
    isRunning = false;
    popupWindow = null;
    mainWindow.restore();
  });
  mainWindow.minimize();
  if (process.env.NODE_ENV === "development") {
    popupWindow.loadURL(`http://localhost:3000#/controls`);
  } else {
    popupWindow.loadFile(path.resolve(__dirname, "../build/index.html"), {
      hash: "/controls",
    });
  }
};

const snooze = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let isRunning = false;

// In main process.
ipcMain.on("start-table-population", async (event, data) => {
  const { path, waitTime } = data;
  isRunning = true;

  const waitTimeSeconds = getWaitTimeInSeconds(waitTime);

  try {
    const fileContent = await fs.promises.readFile(path, "utf-8");
    createPopupWindow();
    const json = JSON.parse(fileContent);
    for (let i = 0; i < waitTimeSeconds; i++) {
      const remainingTime = waitTimeSeconds - i;
      popupWindow.webContents.send("countdown-timer", remainingTime);
      if (remainingTime > 0) {
        await snooze(1000);
      }
    }
    popupWindow.webContents.send("countdown-timer", 0);
    await populateTableData(json.data, event);
  } catch (e) {
    console.log(e);
  }
});

ipcMain.on("stop-table-population", async () => {
  isRunning = false;
});

ipcMain.on("close-popup-window", async () => {
  isRunning = false;
  popupWindow.close();
  popupWindow = null;
  mainWindow.restore();
});

async function populateTableData(data: any, event: any) {
  keyboard.config.autoDelayMs = 1;
  keyboard["nativeAdapter"].keyboard.setKeyboardDelay(100);

  const numberOfCells = data.length * data[0].length;
  const percentagePerCell = 100 / numberOfCells;

  let currentPercentage = 0;

  for (const row of data) {
    for (const value of row) {
      if (!isRunning) {
        return;
      }
      if (value) {
        await keyboard.type(value);
      }
      keyboard.pressKey(Key.Tab);
      currentPercentage += percentagePerCell;
      popupWindow.webContents.send("asynchronous-reply", currentPercentage);
    }
  }
}
