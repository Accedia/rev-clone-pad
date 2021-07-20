import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as path from "path";
import { keyboard, Key } from "@nut-tree/nut-js";
import * as fs from "fs";

let mainWindow: BrowserWindow | null = null;
let popupWindow: BrowserWindow | null = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 150,
    width: 400,
    autoHideMenuBar: true,
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
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
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

const snooze = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let isRunning = false;

// In main process.
ipcMain.on("start-table-population", async (event, filePath) => {
  isRunning = true;

  try {
    const fileContent = await fs.promises.readFile(filePath, "utf-8");

    const display = screen.getPrimaryDisplay();
    popupWindow = new BrowserWindow({
      width: 400,
      height: 200,
      x: display.bounds.width - 550,
      y: 50,
      title: "FIT CCC Automation",
      icon: path.resolve(__dirname, "../icon.png"),
      alwaysOnTop: true,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    mainWindow.minimize();
    popupWindow.loadURL(`http://localhost:3000/controls`);

    const json = JSON.parse(fileContent);
    await snooze(5000);
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
