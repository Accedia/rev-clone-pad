import { Channel } from '../enums';

export interface IpcRenderer {
  sendMessage<T>(channel: Channel, ...args: T[]): void;
  on<T>(
    channel: Channel,
    func: (...args: T[]) => void
  ): (() => void) | undefined;
  once<T>(channel: Channel, func: (...args: T[]) => void): void;
}
