import React from "react";
import { Progress } from "semantic-ui-react";

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="controls-progress">
      <Progress percent={percentage.toFixed(1)} progress autoSuccess indicating>
        {percentage < 100 ? "Entering data..." : "Import complete"}
      </Progress>
    </div>
  );
};

export default ProgressBar;
