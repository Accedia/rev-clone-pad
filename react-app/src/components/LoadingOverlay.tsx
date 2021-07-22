import React from "react";
import { Dimmer, Loader } from "semantic-ui-react";

const LoadingOverlay: React.FC = () => {
  return (
    <Dimmer active>
      <Loader>Loading</Loader>
    </Dimmer>
  );
};

export default LoadingOverlay;
