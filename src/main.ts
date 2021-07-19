import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { keyboard, Key } from "@nut-tree/nut-js";
import * as fs from "fs";

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 800,
  });

  console.log('process.env.NODE_ENV', process.env.NODE_ENV);

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(`http://localhost:4000`);
  } else {
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
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

const snooze = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let isRunning = false;

// In main process.
ipcMain.on('start-table-population', async (event, filePath) => {
  isRunning = true;
  fs.readFile(filePath, 'utf8' , async (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    const json = JSON.parse(res);
    await snooze(5000);
    populateTableData(json.data, event);
  });
});

ipcMain.on('stop-table-population', async () => {
  isRunning = false;
});

async function populateTableData(data: any, event: any) {
    keyboard.config.autoDelayMs = 1;
    keyboard['nativeAdapter'].keyboard.setKeyboardDelay(100)

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
        event.reply('asynchronous-reply', currentPercentage);
      }
    }
}
