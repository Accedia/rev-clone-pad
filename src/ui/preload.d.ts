import { IpcRenderer } from '../shared/models';

declare global {
  interface Window {
    electron: {
      ipcRenderer: IpcRenderer
    };
  }
}

export {};