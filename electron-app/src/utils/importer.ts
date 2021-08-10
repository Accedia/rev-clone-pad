import { Key, keyboard, mouse, screen, centerOf, Point } from "@nut-tree/nut-js";
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
    // TODO detele. Left only for debug purposes
    // screen.config.confidence = 0.7;
    // screen.config.autoHighlight = true;
    // screen.config.highlightDurationMs = 3000;
    // screen.config.highlightOpacity = 0.8;
  };

  public start = () => {
    this._isRunning = true;
  };

  public stop = () => {
    this._isRunning = false;
  };

  startPopulation = async (
    data: string[][],
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
        const lineOperationCoordinates = await this.getLineOperationCoordinates();
        if (lineOperationCoordinates) {
          await this.goToTheFirstCell();
          await this.populateTableData(data, popupWindow, lineOperationCoordinates);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  private getLineOperationCoordinates = async (): Promise<Point> => {
    try {
      const imageCoordinates = await screen.find("./image.png");

      return await centerOf(imageCoordinates);
    } catch (e) {
      // TODO return error to the user
      console.log('Error finding the Line Operation button:', e);
    }
  };

  private goToTheFirstCell = async () => {
    await keyboard.pressKey(Key.Home);
    await keyboard.pressKey(Key.LeftControl, Key.Down);
    await keyboard.releaseKey(Key.LeftControl);
  };

  private populateModalData = async () => {
    await mouse.leftClick();
    await snooze(500);
    await keyboard.pressKey(Key.Down);
    await keyboard.pressKey(Key.Enter);
    // TODO make conditional when there is no part num
    for (let i = 0; i < 3; i++) {
      await keyboard.pressKey(Key.Tab);
    }
    // TODO make the part number to come from the forgettablesForCommit end-point
    await keyboard.type('test part num');
    for (let i = 0; i < 2; i++) {
      await keyboard.pressKey(Key.LeftControl, Key.Tab);
      await keyboard.releaseKey(Key.LeftControl);
    }
    await keyboard.pressKey(Key.Tab);
    // TODO make the line notes to come from the forgettablesForCommit end-point
    await keyboard.type('test line note');
    for (let i = 0; i < 4; i++) {
      await keyboard.pressKey(Key.Tab);
    }
    await keyboard.pressKey(Key.Enter);
    for (let i = 0; i < 3; i++) {
      await keyboard.pressKey(Key.Tab);
    }
  };

  private populateTableData = async (
    data: any[][],
    popupWindow: BrowserWindow,
    lineOperationCoordinates: Point,
  ) => {
    const numberOfCells = data.length * data[0].length;
    const percentagePerCell = 100 / numberOfCells;

    let currentPercentage = 0;

    for (const row of data) {
      for (let i = 0; i < row.length; i++) {
        if (!this.isRunning) {
          return;
        }
        const value = row[i];
        if (value) {
          await keyboard.type(value);
        }
        await keyboard.pressKey(Key.Tab);
        if (i === 8) {
          await mouse.setPosition(lineOperationCoordinates);
          await this.populateModalData();
        }
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
