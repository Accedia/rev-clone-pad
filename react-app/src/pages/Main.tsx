import React, { useRef, useState } from "react";
import { Button, Header, Icon, Input, Popup, Segment } from "semantic-ui-react";

import "./app.css";
declare global {
  interface Window {
    require: any;
  }
}
const electron = window.require("electron");
const { ipcRenderer } = electron;

type WaitTime = "extra-slow" | "slow" | "normal" | "fast";

const Main: React.FC = () => {
  const uploadButtonRef = useRef<any>(null);

  const [waitTime, setWaitTime] = useState<WaitTime>(
    (localStorage.getItem("waitTime") as WaitTime) || "normal"
  );
  const [selectedFile, setSelectedFile] = useState<any>();

  React.useEffect(() => {
    localStorage.setItem("waitTime", waitTime);
  }, [waitTime]);

  const startPopulation = () => {
    if (!selectedFile) return;

    ipcRenderer.send("start-table-population", {
      path: selectedFile.path,
      waitTime,
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target || !e.target.files) return;
    setSelectedFile(e.target.files[0]);
  };

  const getButtonWithPopup = (
    content: string,
    buttonWaitTime: WaitTime,
    popupText: string
  ) => (
    <Popup
      inverted
      content={popupText}
      position="top center"
      trigger={
        <Button
          onClick={() => setWaitTime(buttonWaitTime)}
          active={waitTime === buttonWaitTime}
        >
          {content}
        </Button>
      }
    />
  );
  return (
    <div className="main-container">
      <div className="main-file-upload">
        <h4>
          Data
          <Popup
            inverted
            position="bottom left"
            content="File should be exported from FIT Portal Scrubber"
            trigger={<Icon name="question circle" />}
          />
        </h4>
        <input
          type="file"
          onChange={onFileChange}
          hidden
          accept="application/JSON"
          ref={uploadButtonRef}
        />
        <Segment placeholder size="mini" className="upload-segment">
          <Header icon>
            <Icon name="file outline" />
            {selectedFile ? selectedFile?.path : "No file uploaded"}
            <div className="extension-text">*.json format</div>
          </Header>
          <Button
            icon
            labelPosition="right"
            color="teal"
            onClick={() => uploadButtonRef.current?.click()}
          >
            {selectedFile ? "Replace File" : "Upload"}
            <Icon name={selectedFile ? "exchange" : "upload"} />
          </Button>
        </Segment>
      </div>

      <div className="setting-container">
        <h4>
          Wait time
          <Popup
            inverted
            position="left center"
            content="The time you will have to click the first cell of the CCC application before the population starts."
            trigger={<Icon name="question circle" />}
          />
        </h4>
        <Button.Group widths="4">
          {getButtonWithPopup("Turtle", "extra-slow", "20s")}
          {getButtonWithPopup("Slow", "slow", "15s")}
          {getButtonWithPopup("Normal", "normal", "10s")}
          {getButtonWithPopup("Fast", "fast", "5s")}
        </Button.Group>
      </div>

      <Button
        color="blue"
        icon
        labelPosition="right"
        disabled={!selectedFile?.path}
        onClick={startPopulation}
        fluid
        className="clear-margins"
      >
        Start
        <Icon name="play" />
      </Button>
    </div>
  );
};

export default Main;
