import { Key, keyboard } from "@nut-tree/nut-js";
import { BrowserWindow } from "electron";
import { getWaitTime, getInputSpeed } from '../main';
import { MESSAGE } from "../constants/messages";
import { getWaitTimeInSeconds, getInputSpeedInSeconds } from "./get_config_values";
import { snooze } from "./snooze";

class Importer {
  private _isRunning = false;

  get isRunning(): boolean {
    return this._isRunning;
  }

  public setConfig = (inputSpeed: number) => {
    keyboard.config.autoDelayMs = inputSpeed ** 2;
    keyboard["nativeAdapter"].keyboard.setKeyboardDelay(inputSpeed * 100);
  };

  public start = () => {
    this._isRunning = true;
  };

  public stop = () => {
    this._isRunning = false;
  };

  startPopulation = async (
    data: any[][],
    popupWindow: BrowserWindow
  ) => {
    this.start();
    const waitTime = getWaitTime();
    const inputSpeed = getInputSpeed();
    const waitTimeSeconds = getWaitTimeInSeconds(waitTime);
    const inputSpeedSeconds = getInputSpeedInSeconds(inputSpeed);
    this.setConfig(inputSpeedSeconds)
    try {
      for (let i = 0; i < waitTimeSeconds && this.isRunning; i++) {
        const remainingTime = waitTimeSeconds - i;
        popupWindow.webContents.send(MESSAGE.COUNTDOWN, remainingTime);
        if (remainingTime > 0) {
          await snooze(1000);
        }
      }
      if (this.isRunning) {
        popupWindow.webContents.send(MESSAGE.COUNTDOWN, 0);
        await this.populateTableData(data, popupWindow);
      }
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
