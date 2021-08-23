import React, { useReducer } from "react";
import { Divider, Icon, Loader, Message, Segment } from "semantic-ui-react";
import Timer from "../components/Timer";
import ProgressBar from "../components/ProgressBar";
import { ActionButton } from "../components/ActionButton";
import { useToasts } from "react-toast-notifications";
import { MESSAGE } from "@electron-app";
import reducer, { INITIAL_STATE } from "./reducer";

const electron = window.require("electron");
const { ipcRenderer } = electron;

const Controls: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const { timer, percentage, isRunning, isLoading } = state;
  const { addToast } = useToasts();

  const resetState = () => {
    dispatch({
      type: "@RESET_STATE",
    });
  };

  const stopTablePopulationExecution = () => {
    resetState();
    ipcRenderer.send(MESSAGE.STOP_IMPORTER);
    addToast("Execution stopped successfully", { appearance: "success" });
  };

  React.useEffect(() => {
    const handler = (event: any, percentage: number) => {
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
    };

    ipcRenderer.on(MESSAGE.PROGRESS_UPDATE, handler);
    return () => ipcRenderer.removeListener(MESSAGE.PROGRESS_UPDATE, handler);
  }, []);

  React.useEffect(() => {
    const handler = (event: any, countdownTimer: number) => {
      dispatch({
        type: "@SET_TIMER",
        payload: countdownTimer,
      });
    };

    ipcRenderer.on(MESSAGE.COUNTDOWN, handler);
    return () => ipcRenderer.removeListener(MESSAGE.COUNTDOWN, handler);
  }, []);

  React.useEffect(() => {
    const handler = (event: any, isLoading: boolean) => {
      dispatch({
        type: "@SET_IS_LOADING",
        payload: isLoading,
      });
    };

    ipcRenderer.on(MESSAGE.LOADING_UPDATE, handler);
    return () => ipcRenderer.removeListener(MESSAGE.LOADING_UPDATE, handler);
  }, []);

  React.useEffect(() => {
    const handler = (event: any, message: string) => {
      resetState();
      addToast(message, { appearance: "error", autoDismiss: false });
    };

    ipcRenderer.on(MESSAGE.ERROR, handler);
    return () => ipcRenderer.removeListener(MESSAGE.ERROR, handler);
  }, []);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.RESET_CONTROLS_STATE, resetState);
    return () => ipcRenderer.removeListener(MESSAGE.RESET_CONTROLS_STATE, resetState);
  }, []);

  const renderContent = () => {
    if (timer > 0 && isRunning) {
      return <Timer value={timer} />;
    } else {
      return <ProgressBar percentage={percentage} />;
    }
  };

  console.log({ isLoading, timer });

  if (!isLoading && timer < 0) {
    return <Message>No input currently running</Message>;
  }

  if (isLoading && timer < 0) {
    console.log("show loading");
    return (
      <Loader active inline="centered">
        Downloading forgettables...
      </Loader>
    );
  }

  console.log("main return", { isLoading, timer });

  return (
    <div className="controls-loader">
      {renderContent()}
      {isRunning && (
        <>
          <Divider horizontal>Actions</Divider>
          <ActionButton.Stop onClick={stopTablePopulationExecution} />
        </>
      )}
    </div>
  );
};

export default Controls;
