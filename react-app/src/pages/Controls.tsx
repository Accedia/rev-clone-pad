import React, { useState } from "react";
import { Message } from "semantic-ui-react";
import Timer from "../components/Timer";
import ProgressBar from "../components/ProgressBar";
import LoadingOverlay from "../components/LoadingOverlay";
import { ActionButton } from "../components/ActionButton";

import { MESSAGE } from "@electron-app";
const electron = window.require("electron");
const { ipcRenderer } = electron;

const Controls: React.FC = () => {
  const [stoppedPrematurely, setStoppedPrematurely] = useState(false);
  const [timer, setTimer] = useState<number>(-1);
  const [percentage, setPercentage] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);

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

  const renderContentStopped = () => (
    <Message
      className="stopped-modal"
      warning
      header="Execution stopped"
      content="You can close this window."
    />
  );

  const renderContentWhenRunning = () => {
    if (timer > 0 && isRunning) {
      return <Timer value={timer} />;
    } else {
      return <ProgressBar percentage={percentage} />;
    }
  };

  return (
    <div className="controls-loader">
      {timer < 0 && <LoadingOverlay />}
      <div>
        {stoppedPrematurely
          ? renderContentStopped()
          : renderContentWhenRunning()}
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
