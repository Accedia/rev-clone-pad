import React from 'react';
import { useEffect } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import { MESSAGE } from '@electron-app';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const LoadingPage: React.FC = () => {
  const [status, setStatus] = React.useState('Loading...');

  useEffect(() => {
    ipcRenderer.on(MESSAGE.LOADER_CHECK_UPDATE_STATUS, (event: any, updateMessage: string) => {
      setStatus(updateMessage);
    });
  }, []);

  return (
    <Dimmer active inverted>
      <img src={process.env.PUBLIC_URL + '/icon.ico'} alt="FIT Logo" width="75" className="fit-loader-logo" />
      <Loader inverted inline="centered">
        {status}
      </Loader>
    </Dimmer>
  );
};

export default LoadingPage;
