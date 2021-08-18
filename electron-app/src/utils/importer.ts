import { Key, keyboard, mouse, screen, centerOf, Point } from "@nut-tree/nut-js";
import { BrowserWindow } from "electron";
import { getWaitTime, getInputSpeed } from '../main';
import { MESSAGE } from "../constants/messages";
import { getWaitTimeInSeconds, getInputSpeedInSeconds } from "./get_config_values";
import { snooze } from "./snooze";
import { Forgettable } from '../interfaces/Forgettable';

class Importer {
  private _isRunning = false;

  get isRunning(): boolean {
    return this._isRunning;
  }

  public setConfig = (inputSpeed: number) => {
    keyboard.config.autoDelayMs = inputSpeed ** 2;
    keyboard["nativeAdapter"].keyboard.setKeyboardDelay(inputSpeed * 100);
    // TODO delete. Left only for debug purposes
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
    forgettables: Forgettable[],
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
        const lineOperationCoordinates = await this.getLineOperationCoordinates(popupWindow);
        if (lineOperationCoordinates) {
          await this.goToTheFirstCell();
          await this.populateTableData(data, forgettables, popupWindow, lineOperationCoordinates);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  private getLineOperationCoordinates = async (popupWindow: BrowserWindow): Promise<Point> => {
    try {
      const imageCoordinates = await screen.find("./image.png");

      return await centerOf(imageCoordinates);
    } catch (e) {
      popupWindow.webContents.send(MESSAGE.ERROR, 'Error identifying the Line Operation button. Please make sure the CCC is on your main screen and try again.');
      console.log('Error finding the Line Operation button:', e);
    }
  };

  private goToTheFirstCell = async () => {
    await keyboard.pressKey(Key.Home);
    await keyboard.pressKey(Key.LeftControl, Key.Down);
    await keyboard.releaseKey(Key.LeftControl);
  };

  private populateModalData = async (partNum: string, partNumTabIndex: number, lineNote: string) => {
    await mouse.leftClick();
    await snooze(500);
    await keyboard.pressKey(Key.Down);
    await keyboard.pressKey(Key.Enter);
    for (let i = 0; i < partNumTabIndex; i++) {
      await keyboard.pressKey(Key.Tab);
    }
    if (partNum) {
      await keyboard.type(partNum);
    }
    for (let i = 0; i < 2; i++) {
      await keyboard.pressKey(Key.LeftControl, Key.Tab);
      await keyboard.releaseKey(Key.LeftControl);
    }
    await keyboard.pressKey(Key.Tab);
    if (lineNote) {
      await keyboard.type(lineNote);
    }
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
    forgettables: Forgettable[],
    popupWindow: BrowserWindow,
    lineOperationCoordinates: Point,
  ) => {
    const numberOfCells = data.length * data[0].length;
    const percentagePerCell = 100 / numberOfCells;

    let currentPercentage = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const { partNum, partNumTabIndex, lineNote } = forgettables[i];
      for (let j = 0; j < row.length; j++) {
        if (!this.isRunning) {
          return;
        }
        const value = row[j];
        if (value) {
          await keyboard.type(value);
        }
        await keyboard.pressKey(Key.Tab);
        if (j === 8) {
          await mouse.setPosition(lineOperationCoordinates);
          await this.populateModalData(partNum, partNumTabIndex, lineNote);
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
