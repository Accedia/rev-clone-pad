import React, { useEffect, useMemo, useState } from "react";
import Settings from "./Settings";
import Controls from "./Controls";
import { APP_STATE, MESSAGE } from "@electron-app";

import "./app.css";

const electron = window.require("electron");
const { ipcRenderer } = electron;

type AppStateType = keyof typeof APP_STATE;

const Homepage: React.FC = () => {
  const [appState, setAppState] = useState<AppStateType>("idle");

  useEffect(() => {
    const handler = (event: any, newAppState: AppStateType) => {
      setAppState(newAppState);
    };

    ipcRenderer.on(MESSAGE.UPDATE_APP_STATE, handler);
    return () => ipcRenderer.removeListener(MESSAGE.UPDATE_APP_STATE, handler);
  }, []);

  const renderContent = useMemo(() => {
    switch (appState) {
      case "populating":
      default:
        return <Controls onBack={() => setAppState("idle")} />;
      case "idle":
        return <Settings />;
    }
  }, [appState]);

  return <div className="homepage-container">{renderContent}</div>;
};

export default Homepage;
