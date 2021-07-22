import React from "react";
import { Statistic } from "semantic-ui-react";

interface TimerProps {
  value: number;
}

const Timer: React.FC<TimerProps> = ({ value }) => {
  return (
    <Statistic color="red" size="small">
      <Statistic.Label>Starting in</Statistic.Label>
      <Statistic.Value>{value}</Statistic.Value>
    </Statistic>
  );
};

export default Timer;
