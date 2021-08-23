import React, { useReducer } from "react";
import { Icon, Message } from "semantic-ui-react";
import Timer from "../components/Timer";
import ProgressBar from "../components/ProgressBar";
import LoadingIndicator from "../components/LoadingOverlay";
import { ActionButton } from "../components/ActionButton";
import { useToasts } from "react-toast-notifications";
import { MESSAGE } from "@electron-app";
import reducer, { INITIAL_STATE } from "./reducer";

const electron = window.require("electron");
const { ipcRenderer } = electron;

const Controls: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const { stoppedPrematurely, timer, percentage, isRunning, isLoading, hasError } = state;
  const { addToast } = useToasts();

  const stopTablePopulationExecution = () => {
    dispatch({
      type: "@SET_IS_RUNNING",
      payload: false,
    });
    dispatch({
      type: "@SET_STOPPED_PREMATURELY",
      payload: true,
    });
    ipcRenderer.send(MESSAGE.STOP_IMPORTER);
  };

  const closePopupWindow = () => {
    ipcRenderer.send(MESSAGE.CLOSE_POPUP);
  };

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.PROGRESS_UPDATE, (event: any, percentage: number) => {
      const roundedPercentage = +percentage.toFixed(1);
      if (roundedPercentage >= 100) {
        dispatch({
          type: "@SET_IS_RUNNING",
          payload: false,
        });
      }
      dispatch({
        type: "@SET_PERCENTAGE",
        payload: roundedPercentage,
      });
    });
  }, []);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.COUNTDOWN, (event: any, countdownTimer: number) => {
      dispatch({
        type: "@SET_TIMER",
        payload: countdownTimer,
      });
    });
  }, []);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.LOADING_UPDATE, (event: any, isLoading: boolean) => {
      dispatch({
        type: "@SET_IS_LOADING",
        payload: isLoading,
      });
    });
  }, []);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.ERROR, (event: any, message: string) => {
      dispatch({
        type: "@SET_HAS_ERROR",
        payload: true,
      });
      dispatch({
        type: "@SET_IS_LOADING",
        payload: false,
      });
      dispatch({
        type: "@SET_IS_RUNNING",
        payload: false,
      });
      addToast(message, { appearance: "error", autoDismiss: false });
    });
  }, []);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.RESET_CONTROLS_STATE, () => {
      dispatch({
        type: "@RESET_STATE",
      });
    });
  }, []);

  const renderContentFailed = () => (
    <Message className="failed-modal" error header="Execution failed" content="Please try again." />
  );

  const renderContentStopped = () => (
    <Message className="stopped-modal" warning header="Execution stopped" content="You can close this window." />
  );

  const renderContent = () => {
    if (hasError) {
      return renderContentFailed();
    } else if (stoppedPrematurely) {
      return renderContentStopped();
    } else if (timer > 0 && isRunning) {
      return <Timer value={timer} />;
    } else {
      return <ProgressBar percentage={percentage} />;
    }
  };

  if (timer < 0) {
    return <Message>No input currently running</Message>;
  }

  return (
    <div className="controls-loader">
      {isLoading && timer < 0 ? (
        <LoadingIndicator />
      ) : (
        <>
          <div>{renderContent()}</div>
          <div className="button-group">
            {isRunning ? (
              <ActionButton.Stop onClick={stopTablePopulationExecution} />
            ) : (
              <ActionButton.Close onClick={closePopupWindow} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Controls;
