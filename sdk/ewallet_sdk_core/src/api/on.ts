import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type {
  KeplrWalletCoreEventHandlerMap,
  KeplrWalletCoreEventNames,
} from "../types";

export async function on<
  N extends KeplrWalletCoreEventNames,
  M extends { eventName: N } & KeplrWalletCoreEventHandlerMap,
  H extends M["handler"],
>(this: KeplrEWallet, eventType: N, handler: H) {
  if (this.eventEmitter) {
    this.eventEmitter.on(eventType, (payload: any) => {
      console.log("core on", eventType, payload);

      handler(payload);
    });
  }
}
