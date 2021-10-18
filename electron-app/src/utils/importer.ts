import { ResponseData } from './../interfaces/ResponseData';
import fs from 'fs';
import {
  Key,
  keyboard,
  mouse,
  screen,
  centerOf,
  Point,
  Region,
  getActiveWindow,
  sleep,
} from '@nut-tree/nut-js';
import { BrowserWindow, clipboard } from 'electron';
import { getInputSpeed, mainWindowManager } from '../main';
import { MESSAGE } from '../constants/messages';
import { getInputSpeedInSeconds } from './get_config_values';
import { snooze } from './snooze';
import { Forgettable } from '../interfaces/Forgettable';
import { times } from './times_do';
import { getPopulationData } from './get_population_data';
import log from 'electron-log';
import path from 'path';
import { showMessage } from './show_message';
import { VERIFICATION_PROGRESS_BREAKPOINT } from '../constants/verification_progress_breakpoint';

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
      // Sends a message to stop the loader for fetching data
      electronWindow.webContents.send(MESSAGE.LOADING_UPDATE, false);

      if (this.isRunning) {
        // Start the CCC Waiting loader
        electronWindow.webContents.send(MESSAGE.WAITING_CCC_UPDATE, true);

        // Continuously check for "Line Operations" button
        const lineOperationCoordinates = await this.getLineOperationCoordinates(electronWindow);

        if (lineOperationCoordinates) {
          // Focus the CCC Table so we can get the window information
          await this.focusCccTable(lineOperationCoordinates, true);
          const shouldPopulate = await this.checkIsCccOnFocus(electronWindow, {
            orderCustomerName,
            orderNumber,
          });

          // Stop the CCC Waiting loader
          electronWindow.webContents.send(MESSAGE.WAITING_CCC_UPDATE, false);

          if (shouldPopulate) {
            // Start population
            mainWindowManager.overlayWindow.show();
            await snooze(3000);
            await this.focusCccTable(lineOperationCoordinates);
            await snooze(300);
            await this.goToTheFirstCell();
            await this.populateTableData(forgettables, electronWindow, lineOperationCoordinates);
            await this.verifyPopulation(forgettables, electronWindow);
          } else {
            this.stop();
          }
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

  private focusCccTable = async (lineOperationCoordinates: Point, returnToPosition = false) => {
    const prevPosition = await mouse.getPosition();
    await this.moveToPosition(lineOperationCoordinates.x, lineOperationCoordinates.y + 200);
    await mouse.leftClick();

    if (returnToPosition) {
      await this.moveToPosition(prevPosition.x, prevPosition.y);
    }
  };

  private moveToPosition = async (x: number, y: number) => {
    const coordinates = new Point(x, y);
    await mouse.setPosition(coordinates);
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
    const percentagePerCell = VERIFICATION_PROGRESS_BREAKPOINT / numberOfCells;

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
    orderData: Omit<ResponseData, 'forgettables' | 'automationId'>
  ): Promise<boolean> => {
    const activeWindow = await getActiveWindow();

    const title = await activeWindow.title;
    const includesOrderNumber = title.includes(orderData.orderNumber);
    const includesCustomerName = title.includes(orderData.orderCustomerName);
    log.info(`The current window title is ${title}`);
    log.info(`The current order number is ${orderData.orderNumber}`);
    log.info(`The current customer name is ${orderData.orderCustomerName}`);

    if (!includesOrderNumber && !includesCustomerName) {
      log.info(`Number or customer name not present in window's title`);

      const result = await showMessage({
        type: 'warning',
        buttons: ['Yes, continue', 'Abort'],
        title: 'Warning',
        message: 'CCC estimate may not correspond to the selected RO',
        detail: `The CCC Estimate and the scrubbed estimate (${orderData.orderNumber}) do not match. Do you want to continue?`,
        noLink: true,
      });

      if (result.response === 1) {
        electronWindow.webContents.send(MESSAGE.STOP_IMPORTER_SHORTCUT);
        return false;
      }
    }

    return true;
  };

  private verifyPopulation = async (forgettables: Forgettable[], window: BrowserWindow) => {
    await this.goToTheFirstCell();
    await sleep(10);
    await times(8).pressKey(Key.Tab);

    const reversedForgettables = [...forgettables].reverse();
    const desyncedForgettables: string[] = [];

    let currentPercentage = VERIFICATION_PROGRESS_BREAKPOINT;
    const percentIncrementation = 20 / reversedForgettables.length;

    for (const forgettable of reversedForgettables) {
      await keyboard.pressKey(Key.Up);
      await keyboard.pressKey(Key.LeftControl, Key.C);
      await keyboard.releaseKey(Key.LeftControl, Key.C);
      await sleep(500);
      const description = clipboard.readHTML().replace(/(<([^>]+)>)/gi, '');
      const matches = description.includes(forgettable.description);
      if (!matches) {
        desyncedForgettables.push(description);
      }
      currentPercentage += percentIncrementation;
      window.webContents.send(MESSAGE.PROGRESS_UPDATE, currentPercentage);
    }

    if (desyncedForgettables.length > 0) {
      const forgettableList = desyncedForgettables.map((f) => `  - ${f}`).join('\n');

      await showMessage({
        type: 'warning',
        buttons: ['OK'],
        title: 'Warning',
        message: 'Some lines might not have been imported correctly',
        detail: `The forgettables \n${forgettableList}did not match the corresponding incoming forgettable from FIT REV. \n Please verify if everything is okay with the estimate.`,
        noLink: true,
      });
    }
  };
}

export default new Importer();
