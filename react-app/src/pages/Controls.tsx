import React, { useState } from "react";
import { Message } from "semantic-ui-react";
import Timer from "../components/Timer";
import ProgressBar from "../components/ProgressBar";
import LoadingOverlay from "../components/LoadingOverlay";
import { ActionButton } from "../components/ActionButton";
import { useToasts } from "react-toast-notifications";
import { MESSAGE } from "@electron-app";

const electron = window.require("electron");
const { ipcRenderer } = electron;

const Controls: React.FC = () => {
  const [stoppedPrematurely, setStoppedPrematurely] = useState(false);
  const [timer, setTimer] = useState<number>(-1);
  const [percentage, setPercentage] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const { addToast } = useToasts();

  const stopTablePopulationExecution = () => {
    setIsRunning(false);
    setStoppedPrematurely(true);
    ipcRenderer.send(MESSAGE.STOP_IMPORTER);
  };

  const closePopupWindow = () => {
    ipcRenderer.send(MESSAGE.CLOSE_POPUP);
  };

  React.useEffect(() => {
    ipcRenderer.on(
      MESSAGE.PROGRESS_UPDATE,
      (event: any, percentage: number) => {
        const roundedPercentage = +percentage.toFixed(1);
        if (roundedPercentage >= 100) {
          setIsRunning(false);
        }
        setPercentage(roundedPercentage);
      }
    );
  }, []);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.COUNTDOWN, (event: any, countdownTimer: number) => {
      setTimer(countdownTimer);
    });
  }, []);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.LOADING_UPDATE, (event: any, isLoading: boolean) => {
      console.log('LOADING_UPDATE', isLoading);
      setIsLoading(isLoading);
    });
  }, []);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.ERROR, (event: any, message: string) => {
      console.log('ERROR', message);
      setHasError(true);
      setIsLoading(false);
      setIsRunning(false);
      addToast(message, { appearance: "error", autoDismiss: false });
    });
  }, []);

  const renderContentFailed = () => (
    <Message
      className="failed-modal"
      error
      header="Execution failed"
      content="Please try again."
    />
  );

  const renderContentStopped = () => (
    <Message
      className="stopped-modal"
      warning
      header="Execution stopped"
      content="You can close this window."
    />
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

  return (
    <div className="controls-loader">
      {(isLoading && timer < 0) && <LoadingOverlay />}
      <div>
        {renderContent()}
      </div>
      <div className="button-group">
        {isRunning ? (
          <ActionButton.Stop onClick={stopTablePopulationExecution} />
        ) : (
          <ActionButton.Close onClick={closePopupWindow} />
        )}
      </div>
    </div>
  );
};

export default Controls;
