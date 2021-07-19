import React, { useState } from "react";
import ReactDom from "react-dom";
import { ipcRenderer } from 'electron';
import { Line } from 'rc-progress';

const mainElement = document.createElement("div");
document.body.appendChild(mainElement);

const App = () => {
    const [selectedFile, setSelectedFile] = useState();
    const [percentage, setPercentage] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const sendFilePath = (filePath: string) => {
        // In renderer process (web page).
        setIsRunning(true);
        setPercentage(0);
        ipcRenderer.on('asynchronous-reply', (event, percentage) => {
            if (percentage >= 100) {
                setIsRunning(false);
            }
            setPercentage(percentage);
        });
        ipcRenderer.send('start-table-population', filePath);
    };

    const stopTablePopulationExecution = () => {
        setIsRunning(false);
        ipcRenderer.send('stop-table-population');
    };

    const onFileChange = (e: any) => {
        setSelectedFile(e.target.files[0]);
    };
    
    return (
        <>
            <div>
                <input type="file" onChange={onFileChange} />
            </div>
            <div>
                <Line percent={percentage} strokeWidth="2" strokeColor="#137de8" />
            </div>
            <div>
                {!isRunning && <button onClick={() => sendFilePath(selectedFile.path)}>Start</button>}
                {isRunning && <button onClick={() => stopTablePopulationExecution()}>Stop</button>}
            </div>
        </>
    );
};

ReactDom.render(<App />, mainElement);
