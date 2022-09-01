import { Channel } from '../../shared/enums';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage<T>(channel: Channel, ...args: T[]): void;
        on<T>(
          channel: Channel,
          func: (...args: T[]) => void
        ): (() => void) | undefined;
        once<T>(channel: Channel, func: (...args: T[]) => void): void;
      };
    };
  }
}

export {};