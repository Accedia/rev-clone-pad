import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Channel } from './shared/enums';


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
