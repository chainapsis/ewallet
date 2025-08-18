import type {
  KeplrEWalletEventTypeMap,
  KeplrWalletCoreEventHandler,
  KeplrWalletCoreEventType,
} from "../types";

export class EventEmitter2 {
  listeners: { [key: string]: Function[] };

  constructor() {
    this.listeners = {};
  }

  on<N extends T, T, H>(eventName: N, listener: (event: H) => void) {
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

export function a<T, H>() {
  return class EventEmitter3 {
    listeners: { [key: string]: Function[] };

    constructor() {
      this.listeners = {};
    }

    //   on<N extends T>(eventName: N, listener: (event: H<T>) => void) {
    //     if (!this.listeners[eventName as any]) {
    //       this.listeners[eventName as any] = [];
    //     }
    //     this.listeners[eventName as any].push(listener);
    //   }
    //
    //   emit(eventName: any, args: any) {
    //     if (this.listeners[eventName]) {
    //       this.listeners[eventName].forEach((listener) => listener(args));
    //     }
    //   }
    // };
  };
}
