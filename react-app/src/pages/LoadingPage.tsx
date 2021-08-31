import React, { useCallback } from 'react';
import { useEffect } from 'react';
import { MESSAGE, AppState } from '@electron-app';
import './app.css';
import { Button, Progress } from 'semantic-ui-react';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const LoadingPage: React.FC = () => {
  const [status, setStatus] = React.useState('Loading');
  const [progress, setProgress] = React.useState(0);
  const [appState, setAppState] = React.useState<AppState>('default');

  useEffect(() => {
    ipcRenderer.on(MESSAGE.LOADER_CHECK_UPDATE_STATUS, (event: any, updateMessage: string) => {
      setStatus(updateMessage);
    });
  }, []);

  useEffect(() => {
    ipcRenderer.on(MESSAGE.LOADER_ACTION_REQUIRED, (event: any, action: AppState) => {
      setAppState(action);
    });
  }, []);

  useEffect(() => {
    ipcRenderer.on(MESSAGE.LOADER_PROGRESS, (event: any, _progress: number) => {
      setProgress(_progress);
    });
  }, []);

  const close = useCallback(() => {
    ipcRenderer.send(MESSAGE.CLOSE_APP);
  }, []);

  const getClasses = () => {
    if (appState === 'error') return 'error-loading';
    if (appState === 'complete') return 'success-loading';
    return '';
  };

  return (
    <div className={`loading-page-container ${getClasses()}`}>
      <img
        src={process.env.PUBLIC_URL + '/logo_gif_transparent.gif'}
        alt="FIT Logo"
        width="125"
        className="fit-loader-logo"
      />
      <p className="status-text">
        {status}
        <span>
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </span>
      </p>
      {appState === 'downloading' && (
        <Progress percent={progress} size="tiny" color="blue" className="progress-bar" />
      )}
      {appState === 'error' && <Button content="Close" className="action-button" onClick={close} />}
    </div>
  );
};

export default LoadingPage;
