import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { electron } from '@react-app/utils/electron_remote';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const BackButton: React.FC<ButtonProps> = ({ onClick, disabled }) => (
  <Button icon labelPosition="left" onClick={onClick} disabled={disabled}>
    <Icon name="arrow left" />
    Back
  </Button>
);

const FinishButton: React.FC<ButtonProps> = ({ onClick, disabled }) => (
  <Button icon labelPosition="left" onClick={onClick} disabled={disabled}>
    <Icon name="thumbs up" />
    Finish
  </Button>
);

const StopButton: React.FC<ButtonProps> = ({ onClick, disabled }) => (
  <Button icon labelPosition="left" color="red" onClick={onClick} disabled={disabled}>
    <Icon name="stop" />
    Stop (F10)
  </Button>
);

const ManualButton: React.FC = () => {
  // TODO: Create manual
  const openManual = () => electron.shell.openExternal('http://www.fit-portal.com/spa/scrubber');

  return (
    <Button icon labelPosition="left" onClick={openManual} disabled>
      <Icon name="file alternate" />
      Manual
    </Button>
  );
};

const OpenFitButton: React.FC = () => {
  const openFit = () => electron.shell.openExternal('http://www.fit-portal.com/spa/scrubber');

  return (
    <Button icon labelPosition="left" onClick={openFit}>
      <Icon name="external alternate" />
      Open FIT Scrubber
    </Button>
  );
};
export const ActionButton = {
  Back: BackButton,
  Stop: StopButton,
  Manual: ManualButton,
  OpenFit: OpenFitButton,
  Finish: FinishButton,
};
