import type { KeplrEWalletEventTypeMap } from "../types";

export class EventEmitter2 {
  listeners: { [type: string]: Function[] } = {};

  constructor() {
    this.listeners = {};
  }

  on<T extends keyof KeplrEWalletEventTypeMap>(
    eventName: T,
    listener: (event: CustomEvent<KeplrEWalletEventTypeMap[T]>) => void,
  ) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  emit<T extends keyof KeplrEWalletEventTypeMap>(
    eventName: T,
    args: KeplrEWalletEventTypeMap[T],
  ) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => listener(args));
    }
  }
}
