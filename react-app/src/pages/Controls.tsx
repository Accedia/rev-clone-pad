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
declare global {
  interface Window {
    require: any;
  }
}
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
    ipcRenderer.send("stop-table-population");
  };

  const closePopupWindow = () => {
    ipcRenderer.send("close-popup-window");
  };

  React.useEffect(() => {
    ipcRenderer.on("asynchronous-reply", (event: any, percentage: number) => {
      const roundedPercentage = +percentage.toFixed(1);
      if (roundedPercentage >= 100) {
        setIsRunning(false);
      }
      setPercentage(roundedPercentage);
    });
  }, []);

  React.useEffect(() => {
    ipcRenderer.on("countdown-timer", (event: any, countdownTimer: number) => {
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
        {percentage < 100 ? "Entering data..." : "Complete"}
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

  if (stoppedPrematurely) {
    return (
      <div className="controls-loader">
        <Message
          warning
          header="Execution stopped"
          content="You can close this window and start populating again."
        />
        {closeButton}
      </div>
    );
  }

  return (
    <div className="controls-loader">
      {timer < 0 && (
        <Dimmer active>
          <Loader>Loading</Loader>
        </Dimmer>
      )}
      {timer > 0 && isRunning ? renderTimer() : renderProgress()}

      <div>{isRunning ? stopButton : closeButton}</div>
    </div>
  );
};

export default Controls;
