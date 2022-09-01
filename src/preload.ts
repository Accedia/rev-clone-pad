import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Channel } from './shared/enums';

export type IpcRenderer = {
  sendMessage<T>(channel: Channel, ...args: T[]): void;
  on<T>(
    channel: Channel,
    func: (...args: T[]) => void
  ): (() => void) | undefined;
  once<T>(channel: Channel, func: (...args: T[]) => void): void;
};

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage<T>(channel: Channel, ...args: T[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channel, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channel, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
