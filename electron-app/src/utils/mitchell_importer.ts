import { FirebaseService, SessionStatus } from './firebase';
import importer, { FocusTableOptions, ImageSearchResult, Importer } from './importer';
import { ImporterStoppedException } from './importer_stopped_exception';
import { ResponseData } from './../interfaces/ResponseData';
import { BrowserWindow } from 'electron';
import { getInputSpeed, mainWindowManager } from '../main';
import { MESSAGE } from '../constants/messages';
import { getInputSpeedInSeconds } from './get_config_values';
import { snooze } from './snooze';
import log from 'electron-log';
import fs from 'fs';
import {
  screen,
  centerOf,
  keyboard,
  Point,
  mouse,
  Key,
} from '@nut-tree/nut-js';
import path from 'path';
import { isDev } from './is_dev';
import { MitchellForgettable } from '../interfaces/Forgettable';
import { times } from './times_do';
import { VERIFICATION_PROGRESS_BREAKPOINT } from '../constants/verification_progress_breakpoint';

export class Mitchell_Importer extends Importer {
  constructor() {
    super();
  }

  public setMitchellConfig = (inputSpeed: number, isLookingForCommitButton?: boolean): void => {
    /** Delay between different instructions (e.g. pressKey() and consequential pressKey()) */
    keyboard.config.autoDelayMs = inputSpeed ** 2;
    /** Delay between keystrokes when typing a word (e.g. calling keyboard.type(), time between each letter keypress). */
    keyboard['nativeAdapter'].keyboard.setKeyboardDelay(inputSpeed * 50);
    /** Path with the assets, where we put images for "Manual Line" button image-recognition */
    screen.config.resourceDirectory = isLookingForCommitButton
      ? this.getMitchellPathForCommitButton()
      : this.getMitchellPathForAssets();

    // ! Left only for debug purposes
    // ? Uncomment if needed, do not deploy to prod
    if (isLookingForCommitButton) {
      screen.config.confidence = 0.85;
    }
    // screen.config.autoHighlight = true;
    // screen.config.highlightDurationMs = 3000;
    // screen.config.highlightOpacity = 0.8;
  };

  public startPopulation = async (data: ResponseData, electronWindow: BrowserWindow) => {
    const { forgettables, automationId, automationIdToFinishRPA } = data;
    this.startSession(automationId);
    this.start();
    const inputSpeed = getInputSpeed();
    const inputSpeedSeconds = getInputSpeedInSeconds(inputSpeed);
    this.setMitchellConfig(inputSpeedSeconds, false);

    try {
      /** Sends a message to stop the loader for fetching data */
      electronWindow.webContents.send(MESSAGE.LOADING_UPDATE, false);

      if (this.isRunning) {
        /** Start the CCC Waiting loader */
        //TODO - update message to MITCHELL
        electronWindow.webContents.send(MESSAGE.WAITING_CCC_UPDATE, true);
        await FirebaseService.useCurrentSession.setStatus(SessionStatus.SEARCHING_CCC);

        /** Continuously check for "Line Operations" button */
        const manualLineCoordinates = await this.getManualLineCoordinates(electronWindow);
        // const lineOperationCoordinates = await this.getLineOperationCoordinates(electronWindow);

        if (manualLineCoordinates) {
          const shouldPopulate = await this.getShouldPopulateData(
            manualLineCoordinates,
            data,
            electronWindow
          );

          //   /** Stop the CCC Waiting loader */
          //TODO - update message to MITCHELL
          electronWindow.webContents.send(MESSAGE.WAITING_CCC_UPDATE, false);

          if (shouldPopulate) {
            /** Start population */
            await FirebaseService.useCurrentSession.setStatus(SessionStatus.POPULATING);
            this.progressUpdater.setPercentage(0);
            mainWindowManager.overlayWindow.show();
            await snooze(1000);
            await this.populateMitchellTableData(forgettables, manualLineCoordinates);
            this.setMitchellConfig(inputSpeedSeconds, true);
            await snooze(3000);
            const commitButtonCoordinates = await this.getCommitButtonCoordinates(electronWindow);
            await mouse.setPosition(commitButtonCoordinates);
            await mouse.leftClick();
            this.progressUpdater.update();
            await snooze(4000);
            await times(3).pressKey(Key.Tab);
            this.progressUpdater.update();
            await times(3).pressKey(Key.Tab);
            this.progressUpdater.update();
            await keyboard.pressKey(Key.Enter);
            await keyboard.releaseKey(Key.Enter);
            this.progressUpdater.setPercentage(100);
            await FirebaseService.useCurrentSession.setStatus(SessionStatus.VALIDATING);
            // await this.verifyPopulation(forgettables);
          } else {
            electronWindow.webContents.send(MESSAGE.RESET_CONTROLS_STATE, false);
          }

          await FirebaseService.useCurrentSession.setStatus(SessionStatus.COMPLETED);
          this.complete(automationIdToFinishRPA);
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

  private getMitchellPathForAssets = () => {
    return path.resolve(__dirname, '../../assets/manual-lines');
  };

  private getMitchellPathForCommitButton = () => {
    return path.resolve(__dirname, '../../assets/commit-button');
  };

  private getManualLineCoordinates = async (electronWindow: BrowserWindow): Promise<Point> => {
    const manualLineCoordinates = await this.checkForManualLineCoordinates();

    if (manualLineCoordinates) {
      return manualLineCoordinates;
    } else if (this.isRunning) {
      snooze(1000);
      log.warn('Still searching for Mitchell on the main screen. Retrying...');
      return this.getManualLineCoordinates(electronWindow);
    }
  };

  private getCommitButtonCoordinates = async (electronWindow: BrowserWindow): Promise<Point> => {
    const commitButtonCoordinates = await this.checkForCommitButtonCoordinates();

    if (commitButtonCoordinates) {
      return commitButtonCoordinates;
    } else if (this.isRunning) {
      snooze(1000);
      log.warn('Still searching for Mitchell on the main screen. Retrying...');
      return this.getCommitButtonCoordinates(electronWindow);
    }
  };

  private checkForManualLineCoordinates = async (): Promise<Point> => {
    const images = fs.readdirSync(this.getMitchellPathForAssets());
    const result: ImageSearchResult = {
      coordinates: null,
      errors: [],
    };

    const confidenceThreshold = 0.95;

    for (let i = 0; i < images.length; i++) {
      const name = images[i];
      try {
        const coordinates = await screen.find(name, { confidence: confidenceThreshold });
        result.coordinates = coordinates;
        break;
      } catch (err) {
        result.errors.push(err);
      }
    }

    if (result.coordinates) {
      return await centerOf(result.coordinates);
    } else {
      result.errors.forEach((error) => log.warn('Error finding the Manual Line button', error));
    }
  };

  private checkForCommitButtonCoordinates = async (): Promise<Point> => {
    const images = fs.readdirSync(path.resolve(__dirname, '../../assets/commit-button'));
    const result: ImageSearchResult = {
      coordinates: null,
      errors: [],
    };
    console.log('all images', images);
    for (let i = 0; i < images.length; i++) {
      const name = images[i];
      console.log('name', name);
      try {
        const coordinates = await screen.find(name);
        console.log('screen config', screen.config);
        result.coordinates = coordinates;
        break;
      } catch (err) {
        result.errors.push(err);
      }
    }

    if (result.coordinates) {
      return await centerOf(result.coordinates);
    } else {
      result.errors.forEach((error) => log.warn('Error finding the Manual Line button', error));
    }
  };

  private getShouldPopulateData = async (
    manualLineCoordinates: Point,
    data: ResponseData,
    electronWindow: BrowserWindow
  ): Promise<boolean> => {
    // if (isDev()) return true;

    try {
      await this.focusMitchellTable(manualLineCoordinates, { returnToPosition: true });
      return true;
    } catch (error) {
      log.error(error);
    }
  };

  private focusMitchellTable = async (
    manualLineCoordinates: Point,
    { returnToPosition = false, yOffset = 200 }: FocusTableOptions
  ) => {
    const prevPosition = await mouse.getPosition();
    await importer.moveToPosition(manualLineCoordinates.x, manualLineCoordinates.y);
    await mouse.leftClick();

    // if (returnToPosition) {
    //   await importer.moveToPosition(prevPosition.x, prevPosition.y);
    // }
  };

  private populateMitchellTableData = async (
    forgettables: MitchellForgettable[],
    lineOperationCoordinates: Point
  ) => {
    //We already are at description input field selected once we call this function
    const forgettablesLength = forgettables.length;
    const numberOfInputs = forgettables.length * 8;
    const percentagePerCell = VERIFICATION_PROGRESS_BREAKPOINT / numberOfInputs;
    this.progressUpdater.setStep(percentagePerCell);
    // for (const forgettable of forgettables) {
    for (let i = 0; i < forgettables.length; i++) {
      const { description, partNumber, quantity, partPrice } = forgettables[i];
      //Maybe totalPrice is quantity*partPrice , but remember only consumables have price so make an if check
      //Type Description and Go to Operation
      await this.typeMitchellValue(description);
      this.progressUpdater.update();

      await times(4).pressKey(Key.Tab); // skip Operation stay default, skip Type - stay default Body, skip Total Units - stay default (0)
      await times(2).pressKey(Key.Down); // Selecting Part Type to be Aftermarket New
      await keyboard.pressKey(Key.Enter); // Select it
      await times(7).pressKey(Key.Tab); // focus again on the Part number
      await this.typeMitchellValue(partNumber); // Type Part Number
      this.progressUpdater.update();

      await keyboard.pressKey(Key.Tab); // Go to Quantity
      await keyboard.type(quantity.toString()); // Type Quantity
      this.progressUpdater.update();

      await keyboard.pressKey(Key.Tab); // Go to price

      await this.typeMitchellValue(partPrice); // type totalPrice;
      this.progressUpdater.update();

      await keyboard.pressKey(Key.Tab); // go to checkbox Tax
      await keyboard.pressKey(Key.Space); // Uncheck Tax
      await keyboard.releaseKey(Key.Space); // Uncheck Tax
      this.progressUpdater.update();

      await times(3).pressKey(Key.Tab); // go to 'Add line' button
      await keyboard.pressKey(Key.Enter); // press Add Line with Enter
      await keyboard.releaseKey(Key.Enter);

      this.progressUpdater.update();

      await snooze(2000); // wait until modal is closed

      if (i < forgettablesLength - 1) {
        await mouse.leftClick(); // open the modal again for the next line
      }
      // }
    }
  };

  public typeMitchellValue = async (value: string) => {
    if (value) {
      await keyboard.type(value);
    }
  };
}

export default new Mitchell_Importer();
