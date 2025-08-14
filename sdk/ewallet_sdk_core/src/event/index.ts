import type { KeplrEWalletEventType, KeplrEWalletEventTypeMap } from "../types";

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

  emit<T extends keyof KeplrEWalletEventTypeMap>(eventName: T, ...args: any) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => listener(...args));
    }
  }

  // off<T extends keyof KeplrEWalletEventTypeMap>(eventName:T , listener: Function) {
  //   if (this.listeners[eventName]) {
  //     this.listeners[eventName] = this.listeners[eventName].filter(
  //       (l) => l !== listener,
  //     );
  //   }
  // }
}
