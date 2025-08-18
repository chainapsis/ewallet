import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type { KeplrWalletCoreEventHandlerMap } from "@keplr-ewallet-sdk-core/types";

export async function on<
  N extends KeplrWalletCoreEventHandlerMap["eventName"],
  M extends { eventName: N } & KeplrWalletCoreEventHandlerMap,
>(this: KeplrEWallet, eventType: N, handler: M["handler"]) {
  if (this.eventEmitter) {
    (payload: any) => {
      console.log("core on", eventType, payload);

      handler(payload);
    };
  }
}
