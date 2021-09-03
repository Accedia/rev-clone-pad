export * from './src/constants/messages';
export * from './src/constants/config';
export type { AppState } from './src/interfaces/AppState';

import electron from 'electron';
export type Electron = typeof electron;
export type ElectronRemote = typeof electron.remote;
export type IpcRenderer = typeof electron.ipcRenderer;
