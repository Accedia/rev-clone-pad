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
import { screen, centerOf, keyboard, Point, mouse, getActiveWindow, sleep, randomPointIn, Key } from '@nut-tree/nut-js';
import path from 'path';
import { isDev } from './is_dev';
import { Forgettable } from '../interfaces/Forgettable';
import { times } from './times_do';


export class Mitchell_Importer extends Importer {
  constructor() {
    super();
  }

  public setMitchellConfig = (inputSpeed: number): void => {
    /** Delay between different instructions (e.g. pressKey() and consequential pressKey()) */
    keyboard.config.autoDelayMs = inputSpeed ** 2;
    /** Delay between keystrokes when typing a word (e.g. calling keyboard.type(), time between each letter keypress). */
    keyboard['nativeAdapter'].keyboard.setKeyboardDelay(inputSpeed * 50);
    /** Path with the assets, where we put images for "Manual Line" button image-recognition */
    screen.config.resourceDirectory = this.getMitchellPathForAssets()

    // ! Left only for debug purposes
    // ? Uncomment if needed, do not deploy to prod
    // screen.config.confidence = 0.84;
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
    this.setMitchellConfig(inputSpeedSeconds)

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
            // await this.focusCccTable(lineOperationCoordinates, { yOffset: 250 });
            await snooze(100);
            // await this.saveLastLineNumber();
            // await this.goToTheFirstCell();
            await this.populateMitchellTableData(forgettables, manualLineCoordinates);
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

  private getManualLineCoordinates = async (electronWindow: BrowserWindow): Promise<Point> => {
    const lineOperationCoordinates = await this.checkForManualLineCoordinates();

    if (lineOperationCoordinates) {
      return lineOperationCoordinates;
    } else if (this.isRunning) {
      snooze(1000);
      log.warn('Still searching for Mitchell on the main screen. Retrying...');
      return this.getManualLineCoordinates(electronWindow);
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

  private populateMitchellTableData = async (forgettables: Forgettable[], lineOperationCoordinates: Point) => {
    //We already are at description input field selected once we call this function
    for (const forgettable of forgettables) {
      const { description, partNum, quantity, partPrice } = forgettable
      //Maybe totalPrice is quantity*partPrice , but remember only consumables have price so make an if check
      //Type Description and Go to Operation
      await this.typeMitchellValue(description);
      // await keyboard.pressKey(Key.Tab); // skip Operation stay default
      // await keyboard.pressKey(Key.Tab); // skip Type - stay default Body
      // await keyboard.pressKey(Key.Tab) // skip Total Units - stay default (0)
      await times(5).pressKey(Key.Tab)
      //twice down arrow
      // enter once
      // await times(2).pressKey(Key.Down); // Selecting Part Type to be Aftermarket New
      // await keyboard.pressKey(Key.Enter); // Select it 
      await this.typeMitchellValue(partNum); // Type Part Number
      // console.log('write part number')
      // await keyboard.pressKey(Key.Tab); // Go to Quantity
      // console.log('go to quantity')
      // await this.typeMitchellValue(quantity); // Type Quantity
      // console.log('typ4e 2qunaitty')
      // await times(2).pressKey(Key.Tab) // Skipping Total Price for now , later add if it is consumable - part Price * quantity else skip it (let it be 0)
      // console.log('skip 2 times tgo go tax');
      // await keyboard.pressKey(Key.Space) //Uncheck Tax
      // console.log('tax unchecked')
    }
  }

  public typeMitchellValue = async (value: string) => {
    if (value) {
      await keyboard.type(value);
    }
  };

}

export default new Mitchell_Importer();
