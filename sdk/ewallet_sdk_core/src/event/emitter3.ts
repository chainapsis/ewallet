import type {
  KeplrEWalletCoreEvent,
  KeplrEWalletCoreEventHandlerMap,
} from "@keplr-ewallet-sdk-core/types";

export class CoreEventEmitter {
  listeners: Partial<
    Record<
      KeplrEWalletCoreEventHandlerMap["eventName"],
      KeplrEWalletCoreEventHandlerMap["handler"][]
    >
  >;

  constructor() {
    this.listeners = {};
  }

  on(map: KeplrEWalletCoreEventHandlerMap) {
    if (this.listeners[map.eventName] === undefined) {
      this.listeners[map.eventName] = [];
    }
    (
      this.listeners[
        map.eventName
      ] as KeplrEWalletCoreEventHandlerMap["handler"][]
    ).push(map.handler);
  }

  emit(event: KeplrEWalletCoreEvent) {
    // console.log("emit, eventName: %s", eventName, this.listeners);
    //
    // if (this.listeners[eventName]) {
    //   this.listeners[eventName].forEach((listener) => listener(payload));
    // }
  }
}
