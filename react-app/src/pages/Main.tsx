import React, { useRef, useState } from "react";
import { Button, Header, Icon, Input, Popup, Segment } from "semantic-ui-react";
import { useToasts } from "react-toast-notifications";
import { MESSAGE } from "@electron-app";

import "./app.css";

const electron = window.require("electron");
const { ipcRenderer } = electron;

type WaitTime = "extra-slow" | "slow" | "normal" | "fast";

const Main: React.FC = () => {
  const uploadButtonRef = useRef<any>(null);
  const { addToast } = useToasts();

  const [hadError, setHadError] = useState(false);
  const [waitTime, setWaitTime] = useState<WaitTime>(
    (localStorage.getItem("waitTime") as WaitTime) || "normal"
  );
  const [selectedFile, setSelectedFile] = useState<any>();

  React.useEffect(() => {
    localStorage.setItem("waitTime", waitTime);
  }, [waitTime]);

  React.useEffect(() => {
    ipcRenderer.on(MESSAGE.ERROR_JSON, (event: any, message: string) => {
      setHadError(true);
      addToast(message, { appearance: "error" });
    });
  }, []);

  const startPopulation = () => {
    if (!selectedFile) return;

    ipcRenderer.send(MESSAGE.START_IMPORTER, {
      path: selectedFile.path,
      waitTime,
    });
  };

  const getUploadButtonIcon = () => {
    if (hadError) {
      return "warning sign";
    }
    return selectedFile ? "exchange" : "upload";
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
      // inverted
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
            className="data-popup"
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
            {selectedFile ? selectedFile?.name : "No file uploaded"}
          </Header>
          <Button
            icon
            labelPosition="right"
            color={hadError ? "orange" : "teal"}
            onClick={() => {
              setHadError(false);
              uploadButtonRef.current?.click();
            }}
          >
            {selectedFile ? "Replace File" : "Upload"}
            <Icon name={getUploadButtonIcon()} />
          </Button>
          <div className="extension-text">*.json format</div>
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

      <Popup
        disabled={selectedFile?.path && !hadError}
        inverted
        position="top center"
        content={
          !selectedFile?.path
            ? "No file uploaded"
            : "The selected file is invalid"
        }
        trigger={
          <div style={{ width: "100%" }}>
            <Button
              color="blue"
              icon
              labelPosition="right"
              disabled={!selectedFile?.path || hadError}
              onClick={startPopulation}
              fluid
              className="clear-margins"
            >
              Start
              <Icon name="play" />
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default Main;
