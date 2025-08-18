import type {
  KeplrEWalletEventTypeMap,
  KeplrWalletCoreEventHandler,
} from "../types";

export class EventEmitter2<T, M> {
  listeners: { [key: string]: Function[] };

  constructor() {
    this.listeners = {};
  }

  on(eventName: T, listener: (event: M) => void) {
    if (!this.listeners[eventName as any]) {
      this.listeners[eventName as any] = [];
    }
    this.listeners[eventName as any].push(listener);
  }

  emit(eventName: any, args: any) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => listener(args));
    }
  }
}
