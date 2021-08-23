import fs from "fs";
import { Key, keyboard, mouse, screen, centerOf, Point, Region } from "@nut-tree/nut-js";
import { app, BrowserWindow, screen as electronScreen } from "electron";
import { getWaitTime, getInputSpeed } from "../main";
import { MESSAGE } from "../constants/messages";
import { getWaitTimeInSeconds, getInputSpeedInSeconds } from "./get_config_values";
import { snooze } from "./snooze";
import { Forgettable } from "../interfaces/Forgettable";
import { isAppDev } from "./is_dev";

interface ImageSearchResult {
  coordinates: Region | null;
  errors: string[];
}

class Importer {
  private _isRunning = false;

  get isRunning(): boolean {
    return this._isRunning;
  }

  public setConfig = (inputSpeed: number) => {
    keyboard.config.autoDelayMs = inputSpeed ** 2;
    keyboard["nativeAdapter"].keyboard.setKeyboardDelay(inputSpeed * 100);

    // TODO delete. Left only for debug purposes
    // screen.config.confidence = 0.98;
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

  public startPopulation = async (data: string[][], forgettables: Forgettable[], electronWindow: BrowserWindow) => {
    this.putWindowOnTop(electronWindow);
    this.start();
    const waitTime = getWaitTime();
    const inputSpeed = getInputSpeed();
    const waitTimeSeconds = getWaitTimeInSeconds(waitTime);
    const inputSpeedSeconds = getInputSpeedInSeconds(inputSpeed);
    this.setConfig(inputSpeedSeconds);
    try {
      for (let i = 0; i < waitTimeSeconds && this.isRunning; i++) {
        const remainingTime = waitTimeSeconds - i;
        electronWindow.webContents.send(MESSAGE.COUNTDOWN, remainingTime);
        if (remainingTime > 0) {
          await snooze(1000);
        }
      }
      if (this.isRunning) {
        electronWindow.webContents.send(MESSAGE.COUNTDOWN, 0);
        const lineOperationCoordinates = await this.getLineOperationCoordinates(electronWindow);
        if (lineOperationCoordinates) {
          await this.goToTheFirstCell();
          await this.populateTableData(data, forgettables, electronWindow, lineOperationCoordinates);
        }
      }
      electronWindow.setAlwaysOnTop(false);
    } catch (e) {
      console.log(e);
    }
  };

  private putWindowOnTop = (window: BrowserWindow) => {
    const display = electronScreen.getPrimaryDisplay();
    const [windowWidth] = window.getSize();

    window.setAlwaysOnTop(true);
    window.setPosition(display.bounds.width - windowWidth - 20, 20);
  };

  private getLineOperationCoordinates = async (popupWindow: BrowserWindow): Promise<Point> => {
    const imageDirectory = isAppDev(app) ? "./assets" : "resources/app/assets";
    const images = fs.readdirSync(imageDirectory);
    const result: ImageSearchResult = {
      coordinates: null,
      errors: [],
    };

    for (let i = 0; i < images.length; i++) {
      const name = images[i];
      const fullPath = `${imageDirectory}/${name}`;

      try {
        const coordinates = await screen.find(fullPath);
        result.coordinates = coordinates;
        break;
      } catch (err) {
        result.errors.push(err);
      }
    }

    if (result.coordinates) {
      return await centerOf(result.coordinates);
    } else {
      popupWindow.webContents.send(
        MESSAGE.ERROR,
        "Error identifying the Line Operation button. Please make sure the CCC is on your main screen and try again."
      );
      result.errors.forEach((error) => console.log("Error finding the Line Operation button:", error));
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

    if (partNum && partNumTabIndex > 0) {
      for (let i = 0; i < partNumTabIndex; i++) {
        await keyboard.pressKey(Key.Tab);
      }
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
    lineOperationCoordinates: Point
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
        popupWindow.webContents.send(MESSAGE.PROGRESS_UPDATE, currentPercentage);
      }
    }
    this.stop();
  };
}

export default new Importer();
