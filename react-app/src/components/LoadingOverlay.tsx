import React from "react";
import { Loader } from "semantic-ui-react";

const LoadingIndicator: React.FC = () => {
  return (
    <Loader active inline='centered'>Loading</Loader>
  );
};

export default LoadingIndicator;
