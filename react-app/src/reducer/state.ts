export interface ControlsState {
  stoppedPrematurely: boolean,
  timer: number,
  percentage: number,
  isRunning: boolean,
  isLoading: boolean,
  hasError: boolean,
}

export const INITIAL_STATE: ControlsState = {
  stoppedPrematurely: false,
  timer: -1,
  percentage: 0,
  isRunning: true,
  isLoading: true,
  hasError: false,
};
