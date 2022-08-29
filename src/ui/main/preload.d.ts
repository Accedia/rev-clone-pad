import { Message } from '../../shared/enums';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        sendMessage<T>(message: Message, ...args: T[]): void;
        on<T>(
          message: Message,
          func: (...args: T[]) => void
        ): (() => void) | undefined;
        once<T>(message: Message, func: (...args: T[]) => void): void;
      };
    };
  }
}

export {};