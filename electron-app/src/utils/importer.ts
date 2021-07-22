import { Key, keyboard } from "@nut-tree/nut-js";
import { BrowserWindow } from "electron";
import { MESSAGE } from "../constants/messages";
import { getWaitTimeInSeconds } from "./get_wait_time_in_seconds";
import { snooze } from "./snooze";

class Importer {
  private _isRunning = false;

  get isRunning(): boolean {
    return this._isRunning;
  }

  constructor() {
    keyboard.config.autoDelayMs = 1;
    keyboard["nativeAdapter"].keyboard.setKeyboardDelay(100);
  }

  public start = () => {
    this._isRunning = true;
  };

  public stop = () => {
    this._isRunning = false;
  };

  startPopulation = async (
    data: any[][],
    popupWindow: BrowserWindow,
    waitTime: string
  ) => {
    const waitTimeSeconds = getWaitTimeInSeconds(waitTime);
    try {
      for (let i = 0; i < waitTimeSeconds && this.isRunning; i++) {
        const remainingTime = waitTimeSeconds - i;
        popupWindow.webContents.send(MESSAGE.COUNTDOWN, remainingTime);
        if (remainingTime > 0) {
          await snooze(1000);
        }
      }
      popupWindow.webContents.send(MESSAGE.COUNTDOWN, 0);
      await this.populateTableData(data, popupWindow);
    } catch (e) {
      console.log(e);
    }
  };

  private populateTableData = async (
    data: any[][],
    popupWindow: BrowserWindow
  ) => {
    const numberOfCells = data.length * data[0].length;
    const percentagePerCell = 100 / numberOfCells;

    let currentPercentage = 0;

    for (const row of data) {
      for (const value of row) {
        if (!this.isRunning) {
          return;
        }
        if (value) {
          await keyboard.type(value);
        }
        keyboard.pressKey(Key.Tab);
        currentPercentage += percentagePerCell;
        popupWindow.webContents.send(
          MESSAGE.PROGRESS_UPDATE,
          currentPercentage
        );
      }
    }
    this.stop();
  };
}

export default new Importer();
