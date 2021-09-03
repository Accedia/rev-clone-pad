import React, { useEffect, useMemo, useState } from 'react';
import Settings from './Settings';
import Controls from './Controls';
import { APP_STATE, MESSAGE } from '@electron-app';
import { ipcRenderer } from '@react-app/utils/electron_remote';

import '../styles/app.scss';
import { ToastProvider } from 'react-toast-notifications';

type AppStateType = keyof typeof APP_STATE;

const Homepage: React.FC = () => {
  const [appState, setAppState] = useState<AppStateType>('idle');

  useEffect(() => {
    const handler = (event: any, newAppState: AppStateType) => {
      setAppState(newAppState);
    };

    ipcRenderer.on(MESSAGE.UPDATE_APP_STATE, handler);
    return () => {
      ipcRenderer.removeListener(MESSAGE.UPDATE_APP_STATE, handler);
    };
  }, []);

  const renderContent = useMemo(() => {
    switch (appState) {
      case 'populating':
      default:
        return <Controls onBack={() => setAppState('idle')} />;
      case 'idle':
        /**
         * The ToastProvider overrides the one in App.tsx;
         * reason: change the placement to top-center
         */
        return (
          <ToastProvider
            autoDismiss={true}
            autoDismissTimeout={2500}
            placement="top-center"
            transitionDuration={300}
          >
            <Settings />
          </ToastProvider>
        );
    }
  }, [appState]);

  return <div className="homepage-container">{renderContent}</div>;
};

export default Homepage;
