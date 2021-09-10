import React from 'react';
import { Icon, Progress, Segment } from 'semantic-ui-react';
import Dots from './Dots';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  const isDone = percentage >= 100;

  return (
    <div className="controls-progress">
      <Progress percent={percentage.toFixed(1)} size="small" color="teal" progress className="progress-bar" />
      <Segment compact color={isDone ? 'green' : 'blue'} inverted>
        {isDone ? <Icon name="check circle" /> : <Icon name="circle notched" loading />}
        {isDone ? (
          'Population complete'
        ) : (
          <>
            Population in progress
            <Dots compact />
          </>
        )}
      </Segment>
    </div>
  );
};

export default ProgressBar;
