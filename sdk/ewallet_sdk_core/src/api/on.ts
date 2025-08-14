import type {
  KeplrWalletCoreEventType,
  KeplrWalletCoreEventTypeMap,
} from "@keplr-ewallet-sdk-core/types";
import type { KeplrEWallet } from "@keplr-ewallet-sdk-core/keplr_ewallet";

export async function on<T extends KeplrWalletCoreEventType>(
  this: KeplrEWallet,
  eventType: T,
  handler: (payload: KeplrWalletCoreEventTypeMap[T]) => void, // TODO:
) {
  if (this.eventEmitter) {
    this.eventEmitter.on<T>(eventType, (payload: any) => {
      console.log("[core add listener]", eventType, payload);
      handler(payload);
    });
  }
}
