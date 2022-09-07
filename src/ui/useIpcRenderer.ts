import { IpcRenderer } from '../shared/models';

const useIpcRenderer = (): IpcRenderer => {
  return window.electron.ipcRenderer;
}

export default useIpcRenderer;