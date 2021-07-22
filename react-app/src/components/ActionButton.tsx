import React from "react";
import { Button, Icon } from "semantic-ui-react";

interface ButtonProps {
  onClick: () => void;
}

const CloseButton: React.FC<ButtonProps> = ({ onClick }) => (
  <Button icon labelPosition="right" onClick={onClick}>
    Close
    <Icon name="close" />
  </Button>
);

const StopButton: React.FC<ButtonProps> = ({ onClick }) => (
  <Button icon labelPosition="right" color="red" onClick={onClick}>
    Stop
    <Icon name="stop" />
  </Button>
);

export const ActionButton = {
  Close: CloseButton,
  Stop: StopButton,
};
