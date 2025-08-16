import type { KeplrWalletCoreEventType } from "@keplr-ewallet-sdk-core/types";
import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";

export async function on<T extends KeplrWalletCoreEventType>(
  this: KeplrEWallet,
  eventType: T,
  handler: (payload: T extends "_accountsChanged" ? any : any) => void,
) {
  if (this.eventEmitter) {
    this.eventEmitter.on<T>(eventType, (payload: any) => {
      console.log("core on", eventType, payload);

      handler(payload);
    });
  }
}
