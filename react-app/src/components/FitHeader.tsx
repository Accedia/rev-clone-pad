import React from 'react';
import { Message } from 'semantic-ui-react';
import { electron } from '@react-app/utils/electron_remote';

interface FitHeaderProps {}

const FitHeader: React.FC<FitHeaderProps> = () => {
  return (
    <Message icon>
      <img className="fit-settings-logo" src={process.env.PUBLIC_URL + '/icon.ico'} alt="logo" />
      <Message.Content>
        <Message.Header>Force Import Technology</Message.Header>
        <div className="version-text">
          <span className="version-label">Version:</span> v{electron.remote.app.getVersion()}
        </div>
      </Message.Content>
    </Message>
  );
};

export default FitHeader;
