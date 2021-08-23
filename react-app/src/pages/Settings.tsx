import { INPUT_SPEED_CONFIG, MESSAGE, WAIT_TIME_CONFIG } from "@electron-app";
import React, { useState } from "react";
import { Button, Dimmer, Icon, Loader, Popup, Segment } from "semantic-ui-react";
import { SemanticWIDTHS } from "semantic-ui-react/dist/commonjs/generic";
import SectionTitle from "../components/SectionTitle";

import "./app.css";

type WaitTime = keyof typeof WAIT_TIME_CONFIG;
type InputSpeed = keyof typeof INPUT_SPEED_CONFIG;
interface ElectronRemote {
  getWaitTime: () => WaitTime;
  getInputSpeed: () => InputSpeed;
}

const electron = window.require("electron");
const { ipcRenderer } = electron;
const getElectronRemote = (): ElectronRemote => electron.remote.require("./main.js");

const Settings: React.FC = () => {
  const { getWaitTime, getInputSpeed } = getElectronRemote();
  const storageWaitTime = getWaitTime();
  const storageInputSpeed = getInputSpeed();

  const [waitTime, setWaitTime] = useState<WaitTime>(storageWaitTime || "normal");
  const [inputSpeed, setInputSpeed] = useState<InputSpeed>(storageInputSpeed || "normal");
  const [isPopulating, setIsPopulating] = useState<boolean>(false);

  React.useEffect(() => {
    const handler = (event: any, isLoading: boolean) => {
      setIsPopulating(isLoading);
      console.log(isLoading);
    };

    ipcRenderer.on(MESSAGE.IS_POPULATING_UPDATE, handler);
    return () => ipcRenderer.removeListener(MESSAGE.IS_POPULATING_UPDATE, handler);
  }, []);

  React.useEffect(() => {
    ipcRenderer.send(MESSAGE.SET_WAIT_TIME, waitTime);
  }, [waitTime]);

  React.useEffect(() => {
    ipcRenderer.send(MESSAGE.SET_INPUT_SPEED, inputSpeed);
  }, [inputSpeed]);

  const getButtonWithPopup = (content: string, buttonWaitTime: WaitTime, popupText: string) => (
    <Popup
      content={popupText}
      position="top center"
      inverted
      trigger={
        <Button onClick={() => setWaitTime(buttonWaitTime)} active={waitTime === buttonWaitTime}>
          {content}
        </Button>
      }
    />
  );

  const getButton = (content: string, buttonInputSpeed: InputSpeed) => (
    <Button onClick={() => setInputSpeed(buttonInputSpeed)} active={inputSpeed === buttonInputSpeed}>
      {content}
    </Button>
  );

  return (
    <Dimmer.Dimmable dimmed={isPopulating} className={`main-container`}>
      <Dimmer active={isPopulating}>
        <Icon name="dont" />
        Input in progress...
      </Dimmer>
      <div className="setting-container">
        <SectionTitle
          title="Wait Time"
          popup
          popupContent="The time you will have to click the first cell of the CCC application before the population starts"
          popupPosition="left center"
        />
        <Button.Group widths={Object.keys(WAIT_TIME_CONFIG).length.toString() as SemanticWIDTHS}>
          {(Object.keys(WAIT_TIME_CONFIG) as Array<WaitTime>).map((key) => {
            const config = WAIT_TIME_CONFIG[key];

            return getButtonWithPopup(config.title, key, `${config.value}s`);
          })}
        </Button.Group>
      </div>
      <div className="setting-container">
        <SectionTitle
          title="Input speed"
          popup
          popupContent="The speed of the auto input population. Decrease the speed if you encounter missing symbols or cells"
          popupPosition="right center"
        />
        <Button.Group widths={Object.keys(INPUT_SPEED_CONFIG).length.toString() as SemanticWIDTHS}>
          {(Object.keys(INPUT_SPEED_CONFIG) as Array<InputSpeed>).map((key) => {
            const config = INPUT_SPEED_CONFIG[key];

            return getButton(config.title, key);
          })}
        </Button.Group>
      </div>
    </Dimmer.Dimmable>
  );
};

export default Settings;
