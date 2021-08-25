import fs from 'fs';
import { Key, keyboard, mouse, screen, centerOf, Point, Region, getActiveWindow } from '@nut-tree/nut-js';
import { app, BrowserWindow, screen as electronScreen } from 'electron';
import { getWaitTime, getInputSpeed } from '../main';
import { MESSAGE } from '../constants/messages';
import { getWaitTimeInSeconds, getInputSpeedInSeconds } from './get_config_values';
import { snooze } from './snooze';
import { Forgettable } from '../interfaces/Forgettable';
import { isAppDev } from './is_dev';
import { sendError } from './send_error';
import { times } from './times_do';

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
    keyboard['nativeAdapter'].keyboard.setKeyboardDelay(inputSpeed * 100);

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

  public startPopulation = async (
    data: string[][],
    forgettables: Forgettable[],
    electronWindow: BrowserWindow
  ) => {
    this.start();
    const inputSpeed = getInputSpeed();
    const inputSpeedSeconds = getInputSpeedInSeconds(inputSpeed);
    this.setConfig(inputSpeedSeconds);
    try {
      electronWindow.webContents.send(MESSAGE.LOADING_UPDATE, false);

      await this.waitTimeTimer(electronWindow);

      if (this.isRunning) {
        const isCccOnFocus = await this.checkIsCccOnFocus(electronWindow);
        if (!isCccOnFocus) {
          this.stop();
          return;
        }

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

  private waitTimeTimer = async (electronWindow: BrowserWindow) => {
    const waitTime = getWaitTime();
    const waitTimeSeconds = getWaitTimeInSeconds(waitTime);

    for (let i = 0; i < waitTimeSeconds && this.isRunning; i++) {
      const remainingTime = waitTimeSeconds - i;
      electronWindow.webContents.send(MESSAGE.COUNTDOWN, remainingTime);
      if (remainingTime > 0) {
        await snooze(1000);
      }
    }
  };

  private getLineOperationCoordinates = async (electronWindow: BrowserWindow): Promise<Point> => {
    const imageDirectory = isAppDev(app) ? './assets' : 'resources/app/assets';
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
      sendError(
        electronWindow,
        'Error identifying the Line Operation button. Please make sure the CCC is on your main screen and try again.'
      );
      result.errors.forEach((error) => console.log('Error finding the Line Operation button:', error));
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
      await times(partNumTabIndex).pressKey(Key.Tab);
      await keyboard.type(partNum);
    }

    await times(2).do(async () => {
      await keyboard.pressKey(Key.LeftControl, Key.Tab);
      await keyboard.releaseKey(Key.LeftControl);
    });

    await keyboard.pressKey(Key.Tab);

    if (lineNote) {
      await keyboard.type(lineNote);
    }

    await times(4).pressKey(Key.Tab);
    await keyboard.pressKey(Key.Enter);

    if (lineNote || partNum) {
      await times(3).pressKey(Key.Tab);
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

  private checkIsCccOnFocus = async (electronWindow: BrowserWindow): Promise<boolean> => {
    const primaryDisplay = electronScreen.getPrimaryDisplay();
    const { bounds } = primaryDisplay;
    const activeWindow = await getActiveWindow();

    const title = await activeWindow.title;
    const region = await activeWindow.region;

    if (title !== 'vs.fit-admin.com - Remote Desktop Connection') {
      sendError(electronWindow, 'Please make sure CCC is open and focused.');
      return false;
    }

    const cccOnMainScreen =
      region.left > bounds.x &&
      region.left < bounds.width &&
      region.top > bounds.y &&
      region.top < bounds.height;

    if (!cccOnMainScreen) {
      sendError(electronWindow, 'CCC must be on the main screen');
      return false;
    }

    return true;
  };
}

export default new Importer();
