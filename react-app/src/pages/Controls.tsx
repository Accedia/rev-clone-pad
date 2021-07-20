import React, { useState } from "react";
import { Button, Icon, Message, Progress, Statistic } from "semantic-ui-react";
declare global {
  interface Window {
    require: any;
  }
}
const electron = window.require("electron");
const { ipcRenderer } = electron;

const Controls: React.FC = () => {
  const [stoppedPrematurely, setStoppedPrematurely] = useState(false);
  const [timer, setTimer] = useState<number>(4);
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
      console.log("aaa");
      if (percentage >= 100) {
        setIsRunning(false);
      }
      setPercentage(percentage);
    });
  }, []);

  React.useEffect(() => {
    const counter = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);

      if (timer <= 0) clearInterval(counter);
    }, 1000);
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
      {timer > 0 && isRunning ? renderTimer() : renderProgress()}

      <div>{isRunning ? stopButton : closeButton}</div>
    </div>
  );
};

export default Controls;
