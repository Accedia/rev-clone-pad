import { WaitTime } from '../interfaces/WaitTime';
import { InputSpeed } from '../interfaces/InputSpeed';
import { INPUT_SPEED_CONFIG, WAIT_TIME_CONFIG } from '../constants/config';

export const getWaitTimeInSeconds = (waitTime: WaitTime): number => {
  return WAIT_TIME_CONFIG[waitTime].value + 1;
};

export const getInputSpeedInSeconds = (inputSpeed: InputSpeed): number => {
  return INPUT_SPEED_CONFIG[inputSpeed].value;
};
