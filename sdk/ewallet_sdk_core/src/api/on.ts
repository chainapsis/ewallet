import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type { KeplrWalletCoreEventHandlerMap } from "@keplr-ewallet-sdk-core/types";

export async function on<
  N extends KeplrWalletCoreEventHandlerMap["eventName"],
  M extends { eventName: N } & KeplrWalletCoreEventHandlerMap,
>(this: KeplrEWallet, eventName: N, handler: M["handler"]) {
  if (this.eventEmitter) {
    this.eventEmitter.on(eventName, (payload: any) => {
      console.log("core on", eventName, payload);

      handler(payload);
    });
  }
}
