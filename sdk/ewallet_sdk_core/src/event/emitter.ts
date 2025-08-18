import type {
  KeplrWalletCoreEventHandlerMap,
  KeplrWalletCoreEventNames,
} from "../types";

export class EventEmitter2 {
  listeners: {
    [key in KeplrWalletCoreEventNames]: KeplrWalletCoreEventHandlerMap["handler"][];
  };

  constructor() {
    this.listeners = {} as any;
  }

  on<
    N extends KeplrWalletCoreEventNames,
    M extends { eventName: N } & KeplrWalletCoreEventHandlerMap,
  // H extends M["handler"],
  >(eventName: N, handler: M["handler"]) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
  }

  emit<
    N extends KeplrWalletCoreEventNames,
    M extends { eventName: N } & KeplrWalletCoreEventHandlerMap,
    H extends M["handler"],
  >(eventName: N, payload: Parameters<H>[0]) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => listener(payload as any));
    }
  }
}
