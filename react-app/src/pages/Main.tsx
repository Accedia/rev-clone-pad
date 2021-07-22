import React, { useState } from "react";
import { Button, Icon, Popup } from "semantic-ui-react";
import { useToasts } from "react-toast-notifications";
import { MESSAGE } from "@electron-app";
import UploadFile from "../components/UploadFile";
import SectionTitle from "../components/SectionTitle";
import { UploadedFile } from "../interfaces/UploadedFile";

import "./app.css";

const electron = window.require("electron");
const { ipcRenderer } = electron;

const WAIT_TIME_STORAGE_KEY = "waitTime";
type WaitTime = "extra-slow" | "slow" | "normal" | "fast";

const Main: React.FC = () => {
  const { addToast } = useToasts();
  const localStorageWaitTime = localStorage.getItem(
    WAIT_TIME_STORAGE_KEY
  ) as WaitTime;

  const [hadError, setHadError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile>();
  const [waitTime, setWaitTime] = useState<WaitTime>(
    localStorageWaitTime || "normal"
  );

  React.useEffect(() => {
    localStorage.setItem(WAIT_TIME_STORAGE_KEY, waitTime);
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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target || !e.target.files) return;
    setHadError(false);
    e.target.files.item(0);
    setSelectedFile(e.target.files.item(0) as UploadedFile);
  };

  const startButton = (
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
  );

  const getButtonWithPopup = (
    content: string,
    buttonWaitTime: WaitTime,
    popupText: string
  ) => (
    <Popup
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
        <SectionTitle
          className="data-popup"
          title="Forgettable Data"
          popup
          popupContent="File should be exported from FIT Portal Scrubber"
          popupPosition="bottom left"
        />
        <UploadFile
          selectedFile={selectedFile}
          hadError={hadError}
          onChange={onFileChange}
        />
      </div>
      <div className="setting-container">
        <SectionTitle
          title="Wait Time"
          popup
          popupContent="The time you will have to click the first cell of the CCC application before the population starts"
          popupPosition="left center"
        />
        <Button.Group widths="4">
          {getButtonWithPopup("Turtle", "extra-slow", "20s")}
          {getButtonWithPopup("Slow", "slow", "15s")}
          {getButtonWithPopup("Normal", "normal", "10s")}
          {getButtonWithPopup("Fast", "fast", "5s")}
        </Button.Group>
      </div>
      <Popup
        disabled={!!selectedFile?.path && !hadError}
        inverted
        position="top center"
        content={
          !selectedFile?.path
            ? "No file uploaded"
            : "The selected file is invalid"
        }
        trigger={startButton}
      />
    </div>
  );
};

export default Main;
