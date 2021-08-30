import React from 'react';
import { useEffect } from 'react';
import { MESSAGE } from '@electron-app';
import './app.css';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const LoadingPage: React.FC = () => {
  const [status, setStatus] = React.useState('Loading');

  useEffect(() => {
    ipcRenderer.on(MESSAGE.LOADER_CHECK_UPDATE_STATUS, (event: any, updateMessage: string) => {
      setStatus(updateMessage);
    });
  }, []);

  return (
    <div className="loading-page-container">
      <img
        src={process.env.PUBLIC_URL + '/logo_gif_transparent.gif'}
        alt="FIT Logo"
        width="125"
        className="fit-loader-logo"
      />
      <p>
        {status}
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </p>
    </div>
  );
};

export default LoadingPage;
