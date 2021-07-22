export const getWaitTimeInSeconds = (waitTime: string): number => {
  switch (waitTime) {
    case "extra-slow":
      return 21;
    case "slow":
      return 16;
    case "normal":
      return 11;
    case "fast":
      return 6;
    default:
      return 10;
  }
};
