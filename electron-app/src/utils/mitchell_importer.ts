import { FirebaseService, SessionStatus } from './firebase';
import { ImageSearchResult, Importer } from './importer';
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
  Point,
} from '@nut-tree/nut-js';
import path from 'path';


export class Mitchell_Importer extends Importer {
  constructor() {
    super()
  }

  public startPopulation = async (data: ResponseData, electronWindow: BrowserWindow) => {
    const { forgettables, automationId, automationIdToFinishRPA } = data;

    this.startSession(automationId);
    this.start();
    const inputSpeed = getInputSpeed();
    const inputSpeedSeconds = getInputSpeedInSeconds(inputSpeed);
    this.setConfig(inputSpeedSeconds);

    try {
      /** Sends a message to stop the loader for fetching data */
      electronWindow.webContents.send(MESSAGE.LOADING_UPDATE, false);

      if (this.isRunning) {
        /** Start the CCC Waiting loader */
        electronWindow.webContents.send(MESSAGE.WAITING_MITCHELL_UPDATE, true);
        await FirebaseService.useCurrentSession.setStatus(SessionStatus.SEARCHING_CCC);

        /** Continuously check for "Line Operations" button */
        const manualLineCoordinates = await this.getManualLineCoordinates(electronWindow)
        console.log('manualLineCoordinates', manualLineCoordinates)
        // const lineOperationCoordinates = await this.getLineOperationCoordinates(electronWindow);

        // if (lineOperationCoordinates) {
        //   /** Check if the CCC window's title corresponds to the selected RO */
        //   const shouldPopulate = await this.getShouldPopulate(lineOperationCoordinates, data, electronWindow);

        //   /** Stop the CCC Waiting loader */
        //   electronWindow.webContents.send(MESSAGE.WAITING_CCC_UPDATE, false);

        //   if (shouldPopulate) {
        //     /** Start population */
        //     await FirebaseService.useCurrentSession.setStatus(SessionStatus.POPULATING);
        //     this.progressUpdater.setPercentage(0);
        //     mainWindowManager.overlayWindow.show();
        //     await snooze(1000);
        //     await this.focusCccTable(lineOperationCoordinates, { yOffset: 250 });
        //     await snooze(100);
        //     await this.saveLastLineNumber();
        //     await this.goToTheFirstCell();
        //     await this.populateTableData(forgettables, lineOperationCoordinates);
        //     await FirebaseService.useCurrentSession.setStatus(SessionStatus.VALIDATING);
        //     await this.verifyPopulation(forgettables);
        //   } else {
        //     electronWindow.webContents.send(MESSAGE.RESET_CONTROLS_STATE, false);
        //   }

        await FirebaseService.useCurrentSession.setStatus(SessionStatus.COMPLETED);
        this.complete(automationIdToFinishRPA);
        // }
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

  private getPathForAssets = () => {
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
    const images = fs.readdirSync(this.getPathForAssets());
    const result: ImageSearchResult = {
      coordinates: null,
      errors: [],
    };

    console.log(images);

    const confidenceThreshold = 0.95;

    for (let i = 0; i < images.length; i++) {
      const name = images[i];
      console.log(name);
      try {
        const coordinates = await screen.find(name, { confidence: confidenceThreshold });
        result.coordinates = coordinates;
        break;
      } catch (err) {
        result.errors.push(err);
      }
    }

    console.log(result);

    if (result.coordinates) {
      return await centerOf(result.coordinates);
    } else {
      result.errors.forEach((error) => log.warn('Error finding the Manual Line button', error));
    }
  };

}

export default new Mitchell_Importer();
