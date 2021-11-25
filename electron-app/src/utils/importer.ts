import { ImporterStoppedException } from './importer_stopped_exception';
import { EstimateColumns } from './../constants/estimate_columns';
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
import { isDev } from './is_dev';
import ProgressUpdater from './progress_updater';

interface ImageSearchResult {
  coordinates: Region | null;
  errors: string[];
}

interface FocusCCCTableOptions {
  returnToPosition?: boolean;
  yOffset?: number;
}

class Importer {
  private _isRunning = false;
  private _lastLineNumber: number;
  private progressUpdater = new ProgressUpdater();

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

  public setProgressBrowserWindow = (electronWindow: BrowserWindow) => {
    this.progressUpdater.setElectronWindow(electronWindow);
  };

  public startPopulation = async (data: ResponseData, electronWindow: BrowserWindow) => {
    const { forgettables } = data;

    this.start();
    const inputSpeed = getInputSpeed();
    const inputSpeedSeconds = getInputSpeedInSeconds(inputSpeed);
    this.setConfig(inputSpeedSeconds);

    try {
      /** Sends a message to stop the loader for fetching data */
      electronWindow.webContents.send(MESSAGE.LOADING_UPDATE, false);

      if (this.isRunning) {
        /** Start the CCC Waiting loader */
        electronWindow.webContents.send(MESSAGE.WAITING_CCC_UPDATE, true);

        /** Continuously check for "Line Operations" button */
        const lineOperationCoordinates = await this.getLineOperationCoordinates(electronWindow);

        if (lineOperationCoordinates) {
          /** Check if the CCC window's title corresponds to the selected RO */
          const shouldPopulate = await this.getShouldPopulate(lineOperationCoordinates, data, electronWindow);

          /** Stop the CCC Waiting loader */
          electronWindow.webContents.send(MESSAGE.WAITING_CCC_UPDATE, false);

          if (shouldPopulate) {
            /** Start population */
            this.progressUpdater.setPercentage(0);
            mainWindowManager.overlayWindow.show();
            await snooze(1000);
            await this.focusCccTable(lineOperationCoordinates, { yOffset: 250 });
            await snooze(100);
            await this.saveLastLineNumber();
            await this.goToTheFirstCell();
            await this.populateTableData(forgettables, electronWindow, lineOperationCoordinates);
            await this.verifyPopulation(forgettables);
          }

          this.stop();
        }
      }

      mainWindowManager.overlayWindow.hide();
      electronWindow.setAlwaysOnTop(false);
    } catch (e) {
      if (e instanceof ImporterStoppedException) {
        mainWindowManager.overlayWindow.hide();
      } else {
        log.error('Error populating the data', e);
        electronWindow.webContents.send(MESSAGE.ERROR, e.message);
      }
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

  private focusCccTable = async (
    lineOperationCoordinates: Point,
    { returnToPosition = false, yOffset = 200 }: FocusCCCTableOptions
  ) => {
    const prevPosition = await mouse.getPosition();
    await this.moveToPosition(lineOperationCoordinates.x, lineOperationCoordinates.y + yOffset);
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
    await keyboard.pressKey(Key.PageDown);
  };

  private populateModalData = async (partNum: string, partNumTabIndex: number, lineNote: string) => {
    await mouse.leftClick();
    await snooze(500);

    this.stopCheckPoint();

    await keyboard.pressKey(Key.Down);
    await keyboard.pressKey(Key.Enter);

    this.stopCheckPoint();

    if (partNum && partNumTabIndex > 0) {
      await times(partNumTabIndex).pressKey(Key.Tab);
      await keyboard.type(partNum);
    }

    this.stopCheckPoint();

    await times(2).do(async () => {
      await keyboard.pressKey(Key.LeftControl, Key.Tab);
      await keyboard.releaseKey(Key.LeftControl);
    });

    await keyboard.pressKey(Key.Tab);

    this.stopCheckPoint();

    if (lineNote) {
      await keyboard.type(lineNote);
    }

    await times(4).pressKey(Key.Tab);
    await keyboard.pressKey(Key.Enter);

    this.stopCheckPoint();

    if (lineNote || partNum) {
      await times(3).pressKey(Key.Tab);
    }
  };

  private populateTableData = async (
    forgettables: Forgettable[],
    popupWindow: BrowserWindow,
    lineOperationCoordinates: Point
  ) => {
    const numberOfCells = forgettables.length * 15;
    const percentagePerCell = VERIFICATION_PROGRESS_BREAKPOINT / numberOfCells;
    this.progressUpdater.setStep(percentagePerCell);

    for (const forgettable of forgettables) {
      const rowData = getPopulationData(forgettable);
      const { partNum, partNumTabIndex, lineNote } = forgettable;

      for (let column = 0; column <= EstimateColumns.PRICE; column++) {
        this.stopCheckPoint();
        const value = rowData[column];

        /** type value and go to next cell */
        await this.typeValue(value);
        await keyboard.pressKey(Key.Tab);

        /** Open the line operations modal and populate the required data */
        this.stopCheckPoint();
        if (column === EstimateColumns.DESCRIPTION) {
          await mouse.setPosition(lineOperationCoordinates);
          await this.populateModalData(partNum, partNumTabIndex, lineNote);
        }

        /**
         * Needed because sometimes CCC will display an error
         * that the sum is over a certain threshold which blocks the execution.
         *
         * This closes the potential warning message and places the input on the last cell.
         */
        this.stopCheckPoint();
        if (column === EstimateColumns.PRICE) {
          await keyboard.pressKey(Key.Tab);
          await keyboard.pressKey(Key.Enter);
          await keyboard.pressKey(Key.End);
        }

        this.progressUpdater.update();
      }

      /**
       * Continue from the last input cell backwards &
       * enter the remaining values
       */
      for (let column = EstimateColumns.PAINT; column >= EstimateColumns.LABOR; column--) {
        this.stopCheckPoint();
        const value = rowData[column];
        await this.typeValue(value);
        await keyboard.pressKey(Key.Left);

        this.progressUpdater.update();
      }

      /** Continue with next line */
      this.stopCheckPoint();
      await keyboard.pressKey(Key.Down);
      await keyboard.pressKey(Key.Home);
    }
  };

  private typeValue = async (value: string) => {
    if (value) {
      await keyboard.type(value);
    }
  };

  private checkIsCccOnFocus = async (
    electronWindow: BrowserWindow,
    orderData: Omit<ResponseData, 'forgettables' | 'automationId'>
  ): Promise<boolean> => {
    const activeWindow = await getActiveWindow();

    const title = await activeWindow.title;
    const includesOrderNumber = title.includes(orderData.orderNumber);
    const includesCustomerName = title.includes(orderData.orderCustomerName);

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

  private verifyPopulation = async (forgettables: Forgettable[]) => {
    const lastLineNumberAfterImport = await this.getLastLineNumber();
    const expectedLineNumber = this._lastLineNumber + forgettables.length;

    this.progressUpdater.setPercentage(100);

    if (lastLineNumberAfterImport === expectedLineNumber) {
      return true;
    } else {
      mainWindowManager.overlayWindow.hide();

      log.warn(
        `Population not successful: The last line number was ${lastLineNumberAfterImport} and the expected value was ${expectedLineNumber}`
      );

      await showMessage({
        type: 'warning',
        buttons: ['OK'],
        title: 'Warning',
        message: 'Import might not have been successful',
        detail: `The program detected that there might have been an issue during force import and some lines may be missing. Please verify.`,
        noLink: true,
      });
      return false;
    }
  };

  private stopCheckPoint = () => {
    if (!this.isRunning) {
      throw new ImporterStoppedException();
    }
  };

  private getLastLineNumber = async () => {
    await this.goToTheFirstCell();
    await times(5).pressKey(Key.Tab);
    await keyboard.pressKey(Key.Up);

    this.stopCheckPoint();

    await this.pressCtrlC();
    const copiedText = this.getTextFromClipboard();

    log.info(`Last line number is ${copiedText}, int: (${parseInt(copiedText)})`);

    return parseInt(copiedText);
  };

  private saveLastLineNumber = async () => {
    this._lastLineNumber = await this.getLastLineNumber();
  };

  private pressCtrlC = async () => {
    await keyboard.pressKey(Key.LeftControl, Key.C);
    await keyboard.releaseKey(Key.LeftControl, Key.C);

    /**
     * Needed because CTRL + C locks the clipboard process
     * and if tried to be accessed too quickly an error is thrown
     */
    await sleep(700);
  };

  private getTextFromClipboard = () => {
    return (
      clipboard
        .readHTML()
        // Since we copy from a table, we get HTML in the clipboard -> Remove HTML tags
        .replace(/(<([^>]+)>)/gi, '')
        // Remove whitespace characters
        .replace(/\s/g, '')
    );
  };

  private getShouldPopulate = async (
    lineOperationCoordinates: Point,
    data: ResponseData,
    electronWindow: BrowserWindow
  ): Promise<boolean> => {
    if (isDev()) return true;

    const { orderCustomerName, orderNumber } = data;

    await this.focusCccTable(lineOperationCoordinates, { returnToPosition: true });

    return this.checkIsCccOnFocus(electronWindow, {
      orderCustomerName,
      orderNumber,
    });
  };
}

export default new Importer();
