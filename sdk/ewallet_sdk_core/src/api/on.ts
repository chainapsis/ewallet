import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type { KeplrEWalletCoreEventHandlerMap } from "@keplr-ewallet-sdk-core/types";

export async function on<
  N extends KeplrEWalletCoreEventHandlerMap["eventName"],
  M extends { eventName: N } & KeplrEWalletCoreEventHandlerMap,
>(this: KeplrEWallet, eventName: N, handler: M["handler"]) {
  if (this.eventEmitter) {
    this.eventEmitter.on(eventName, (payload: any) => {
      console.log("core on", eventName, payload);

      handler(payload);
    });
  }
}
