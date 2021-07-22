import React, { useState } from "react";
import {
  Button,
  Dimmer,
  Icon,
  Loader,
  Message,
  Progress,
  Statistic,
} from "semantic-ui-react";
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

  const renderTimer = () => (
    <Statistic color="red" size="small">
      <Statistic.Label>Starting in</Statistic.Label>
      <Statistic.Value>{timer}</Statistic.Value>
    </Statistic>
  );

  const renderProgress = () => (
    <div className="controls-progress">
      <Progress percent={percentage.toFixed(1)} progress autoSuccess indicating>
        {percentage < 100 ? "Entering data..." : "Import complete"}
        {percentage >= 100 && (
          <div className="complete-bonus-text">
            You may close this window now
          </div>
        )}
      </Progress>
    </div>
  );

  const stopButton = React.useMemo(
    () => (
      <Button
        icon
        labelPosition="right"
        color="red"
        onClick={() => stopTablePopulationExecution()}
      >
        Stop
        <Icon name="stop" />
      </Button>
    ),
    []
  );

  const closeButton = React.useMemo(
    () => (
      <Button icon labelPosition="right" onClick={() => closePopupWindow()}>
        Close
        <Icon name="close" />
      </Button>
    ),
    []
  );

  return (
    <div className="controls-loader">
      {timer < 0 && (
        <Dimmer active>
          <Loader>Loading</Loader>
        </Dimmer>
      )}
      <div>
        {stoppedPrematurely && (
          <Message
            className="stopped-modal"
            warning
            header="Execution stopped"
            content="You can close this window."
          />
        )}
        {!stoppedPrematurely
          ? timer > 0 && isRunning
            ? renderTimer()
            : renderProgress()
          : null}
      </div>

      <div className="button-group">{isRunning ? stopButton : closeButton}</div>
    </div>
  );
};

export default Controls;
