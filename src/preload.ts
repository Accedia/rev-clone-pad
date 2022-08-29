import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Message } from './shared/enums';

export type IpcRenderer = {
  sendMessage<T>(message: Message, ...args: T[]): void;
  on<T>(
    message: Message,
    func: (...args: T[]) => void
  ): (() => void) | undefined;
  once<T>(message: Message, func: (...args: T[]) => void): void;
};

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage<T>(message: Message, ...args: T[]) {
      ipcRenderer.send(message, args);
    },
    on(message: Message, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(message, subscription);

      return () => ipcRenderer.removeListener(message, subscription);
    },
    once(message: Message, func: (...args: unknown[]) => void) {
      ipcRenderer.once(message, (_event, ...args) => func(...args));
    },
  },
});
