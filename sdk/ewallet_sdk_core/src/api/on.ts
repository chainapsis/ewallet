import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";
import type { KeplrEWalletEventType } from "@keplr-ewallet-sdk-core/types";

export async function on(
  this: KeplrEWallet,
  eventType: KeplrEWalletEventType,
  handler: Function, // TODO:
) {
  if (this.eventEmitter) {
    this.eventEmitter.on("accountsChanged", () => {
      console.log(123);
    });
  }
}
