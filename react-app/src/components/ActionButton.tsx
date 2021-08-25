import React from 'react';
import { Button, Icon } from 'semantic-ui-react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const SettingsButton: React.FC<ButtonProps> = ({ onClick, disabled }) => (
  <Button icon labelPosition="right" onClick={onClick} disabled={disabled}>
    Settings
    <Icon name="setting" />
  </Button>
);

const StopButton: React.FC<ButtonProps> = ({ onClick, disabled }) => (
  <Button icon labelPosition="right" color="red" onClick={onClick} disabled={disabled}>
    Stop (F10)
    <Icon name="stop" />
  </Button>
);

export const ActionButton = {
  Settings: SettingsButton,
  Stop: StopButton,
};
