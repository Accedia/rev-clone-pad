import React, { useRef, useState } from "react";
import { Button, Icon, Input } from "semantic-ui-react";

import "./app.css";
declare global {
  interface Window {
    require: any;
  }
}
const electron = window.require("electron");
const { ipcRenderer } = electron;

const Main: React.FC = () => {
  const uploadButtonRef = useRef<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>();

  const startPopulation = () => {
    if (!selectedFile) return;

    ipcRenderer.send("start-table-population", selectedFile.path);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target || !e.target.files) return;
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="main-container">
      <div className="main-file-upload">
        <input
          type="file"
          onChange={onFileChange}
          hidden
          ref={uploadButtonRef}
        />
        <Input type="text" placeholder="No file selected" action fluid>
          <input value={selectedFile?.path || "No file selected"} />
          <Button
            icon
            labelPosition="right"
            onClick={() => uploadButtonRef.current?.click()}
          >
            Upload
            <Icon name="upload" />
          </Button>
        </Input>
      </div>

      <div>
        <Button
          color="blue"
          icon
          labelPosition="right"
          disabled={!selectedFile?.path}
          onClick={startPopulation}
        >
          Start
          <Icon name="play" />
        </Button>
      </div>
    </div>
  );
};

export default Main;
