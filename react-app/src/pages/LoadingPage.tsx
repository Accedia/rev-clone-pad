import React from "react";
import { useEffect } from "react";
import { Dimmer, Loader } from "semantic-ui-react";

const steps = [
  "Initial load...",
  "Checking for updates...",
  "Loading main window...",
  "Ready",
];

const LoadingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStep < steps.length - 2) {
        setCurrentStep((prevStep) => prevStep + 1);
      } else {
        clearInterval(interval);
        return;
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dimmer active inverted>
      <img
        src={process.env.PUBLIC_URL + "/icon.ico"}
        alt="FIT Logo"
        width="75"
        className="fit-loader-logo"
      />
      <Loader inverted inline="centered">
        {steps[currentStep]} {currentStep + 1}/{steps.length}
      </Loader>
    </Dimmer>
  );
};

export default LoadingPage;
