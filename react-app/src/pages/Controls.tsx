import React, { useCallback, useReducer } from 'react';
import { Divider, Loader, Message } from 'semantic-ui-react';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import { ActionButton } from '../components/ActionButton';
import { useToasts } from 'react-toast-notifications';
import { MESSAGE } from '@electron-app';
import reducer, { INITIAL_STATE } from './reducer';

const electron = window.require('electron');
const { ipcRenderer } = electron;

interface ControlsProps {
  onBack?: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onBack }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const { timer, percentage, isRunning, isLoading } = state;
  const { addToast } = useToasts();

  const resetState = () => {
    dispatch({
      type: '@RESET_STATE',
    });
  };

  const stopPopulationStateUpdate = useCallback(() => {
    resetState();
    dispatch({
      type: '@SET_IS_RUNNING',
      payload: false,
    });
    dispatch({
      type: '@SET_STOPPED_PREMATURELY',
      payload: true,
    });
    addToast('Execution stopped successfully', { appearance: 'success' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTablePopulationExecution = () => {
    stopPopulationStateUpdate();
    ipcRenderer.send(MESSAGE.STOP_IMPORTER);
  };

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.STOP_IMPORTER_SHORTCUT, stopPopulationStateUpdate);
    return () => ipcRenderer.removeListener(MESSAGE.STOP_IMPORTER_SHORTCUT, stopPopulationStateUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const handler = (event: any, percentage: number) => {
      const roundedPercentage = +percentage.toFixed(1);
      if (roundedPercentage >= 100) {
        dispatch({
          type: '@SET_IS_RUNNING',
          payload: false,
        });
      }
      dispatch({
        type: '@SET_PERCENTAGE',
        payload: roundedPercentage,
      });
    };

    ipcRenderer.on(MESSAGE.PROGRESS_UPDATE, handler);
    return () => ipcRenderer.removeListener(MESSAGE.PROGRESS_UPDATE, handler);
  }, []);

  React.useEffect(() => {
    const handler = (event: any, countdownTimer: number) => {
      dispatch({
        type: '@SET_TIMER',
        payload: countdownTimer,
      });
    };

    ipcRenderer.on(MESSAGE.COUNTDOWN, handler);
    return () => ipcRenderer.removeListener(MESSAGE.COUNTDOWN, handler);
  }, []);

  React.useEffect(() => {
    const handler = (event: any, isLoading: boolean) => {
      dispatch({
        type: '@SET_IS_LOADING',
        payload: isLoading,
      });
    };

    ipcRenderer.on(MESSAGE.LOADING_UPDATE, handler);
    return () => ipcRenderer.removeListener(MESSAGE.LOADING_UPDATE, handler);
  }, []);

  React.useEffect(() => {
    const handler = (event: any, message: string) => {
      resetState();
      dispatch({
        type: '@SET_IS_RUNNING',
        payload: false,
      });
      addToast(message, { appearance: 'error', autoDismiss: false });
    };

    ipcRenderer.on(MESSAGE.ERROR, handler);
    return () => ipcRenderer.removeListener(MESSAGE.ERROR, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.RESET_CONTROLS_STATE, resetState);
    return () => ipcRenderer.removeListener(MESSAGE.RESET_CONTROLS_STATE, resetState);
  }, []);

  const isIdle = !isLoading && timer < 0;
  const isDownloadingForgettables = isLoading && timer < 0;
  const isInWaitTime = timer > 0 && isRunning;

  const renderContent = () => {
    if (isIdle) {
      return (
        <Message>
          <Message.Header>No input currently running</Message.Header>
          You can start one from FIT REV Scrubber
        </Message>
      );
    }

    if (isInWaitTime) {
      return <Timer value={timer} />;
    }

    return <ProgressBar percentage={percentage} />;
  };

  if (isDownloadingForgettables) {
    return (
      <div className="loader-container">
        <Loader active inline="centered">
          Downloading forgettables...
        </Loader>
      </div>
    );
  }

  return (
    <div className="controls-loader">
      <div>{renderContent()}</div>
      <div>
        {!isDownloadingForgettables && (
          <>
            <Divider horizontal>Actions</Divider>
            <div className="button-group">
              {isRunning && <ActionButton.Stop onClick={stopTablePopulationExecution} />}
              {onBack && <ActionButton.Settings onClick={onBack} disabled={isRunning} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Controls;
