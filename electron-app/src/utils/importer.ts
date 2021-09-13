import { ResponseData } from './../interfaces/ResponseData';
import fs from 'fs';
import { Key, keyboard, mouse, screen, centerOf, Point, Region, getActiveWindow } from '@nut-tree/nut-js';
import { BrowserWindow, dialog, MessageBoxOptions } from 'electron';
import { getInputSpeed, mainWindowManager } from '../main';
import { MESSAGE } from '../constants/messages';
import { getInputSpeedInSeconds } from './get_config_values';
import { snooze } from './snooze';
import { Forgettable } from '../interfaces/Forgettable';
import { times } from './times_do';
import { getPopulationData } from './get_population_data';
import log from 'electron-log';
import path from 'path';

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
    screen.config.resourceDirectory = this.getAssetsPath();

    // TODO delete. Left only for debug purposes
    // screen.config.confidence = 0.84;
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

  public startPopulation = async (data: ResponseData, electronWindow: BrowserWindow) => {
    const { forgettables, orderCustomerName, orderNumber } = data;

    this.start();
    const inputSpeed = getInputSpeed();
    const inputSpeedSeconds = getInputSpeedInSeconds(inputSpeed);
    this.setConfig(inputSpeedSeconds);
    try {
      electronWindow.webContents.send(MESSAGE.LOADING_UPDATE, false);

      if (this.isRunning) {
        // TODO fix issue when click Abort
        // const isCccOnFocus = await this.checkIsCccOnFocus(electronWindow, { orderCustomerName, orderNumber });
        // if (!isCccOnFocus) {
        //   this.stop();
        //   return;
        // }

        electronWindow.webContents.send(MESSAGE.WAITING_CCC_UPDATE, true);
        const lineOperationCoordinates = await this.getLineOperationCoordinates(electronWindow);
        if (lineOperationCoordinates) {
          mainWindowManager.overlayWindow.show();
          electronWindow.webContents.send(MESSAGE.WAITING_CCC_UPDATE, false);
          await snooze(3000);
          await this.focusCccTable(lineOperationCoordinates);
          await this.goToTheFirstCell();
          await this.populateTableData(forgettables, electronWindow, lineOperationCoordinates);
        }
      }
      mainWindowManager.overlayWindow.hide();
      electronWindow.setAlwaysOnTop(false);
    } catch (e) {
      log.error('Error populating the data', e);
      electronWindow.webContents.send(MESSAGE.ERROR, e.message);
    }
  };

  private getLineOperationCoordinates = async (electronWindow: BrowserWindow): Promise<Point> => {
    const lineOperationCoordinates = await this.checkForLineOperationCoordinates();

    if (lineOperationCoordinates) {
      return lineOperationCoordinates;
    } else if (this.isRunning) {
      snooze(1000);
      log.warn('Still searching for CCC on the main screen. Retrying...');
      return this.getLineOperationCoordinates(electronWindow);
    }
  };

  private getAssetsPath = () => {
    return path.resolve(__dirname, '../../assets/line-operation');
  };

  private checkForLineOperationCoordinates = async (): Promise<Point> => {
    const images = fs.readdirSync(this.getAssetsPath());
    const result: ImageSearchResult = {
      coordinates: null,
      errors: [],
    };

    for (let i = 0; i < images.length; i++) {
      const name = images[i];

      try {
        const coordinates = await screen.find(name);
        result.coordinates = coordinates;
        break;
      } catch (err) {
        result.errors.push(err);
      }
    }

    if (result.coordinates) {
      return await centerOf(result.coordinates);
    } else {
      result.errors.forEach((error) => log.warn('Error finding the Line Operation button', error));
    }
  };

  private focusCccTable = async (lineOperationCoordinates: Point) => {
    const tableCoordinates = new Point(lineOperationCoordinates.x, lineOperationCoordinates.y + 200);
    await mouse.setPosition(tableCoordinates);
    await mouse.leftClick();
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
    forgettables: Forgettable[],
    popupWindow: BrowserWindow,
    lineOperationCoordinates: Point
  ) => {
    const data = getPopulationData(forgettables);
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

  private checkIsCccOnFocus = async (
    electronWindow: BrowserWindow,
    orderData: Omit<ResponseData, 'forgettables'>
  ): Promise<boolean> => {
    const activeWindow = await getActiveWindow();

    const title = await activeWindow.title;

    if (!title.includes(orderData.orderNumber) && !title.includes(orderData.orderCustomerName)) {
      const dialogOpts: MessageBoxOptions = {
        type: 'warning',
        buttons: ['Yes, continue', 'Abort'],
        title: 'Warning',
        message: 'CCC estimate may not correspond to the selected RO',
        detail: `The CCC Estimate and the scrubbed estimate (${orderData.orderNumber}) do not match or CCC Estimate is not opened or on focus. Do you want to continue?`,
        noLink: true,
      };

      const result = await dialog.showMessageBox(
        new BrowserWindow({
          show: false,
          alwaysOnTop: true,
        }),
        dialogOpts
      );
      if (result.response === 1) {
        electronWindow.webContents.send(MESSAGE.STOP_IMPORTER_SHORTCUT);
        return false;
      }
    }

    return true;
  };
}

export default new Importer();
