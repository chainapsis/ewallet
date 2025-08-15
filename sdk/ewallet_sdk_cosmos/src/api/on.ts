import type {
  KeplrCosmosEWalletEventTypeMap,
  KeplrCosmosEWalletEventType,
} from "@keplr-ewallet/ewallet-sdk-core";

import type { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";

export async function on<T extends KeplrCosmosEWalletEventType>(
  this: CosmosEWallet,
  eventType: T,
  handler: (payload: KeplrCosmosEWalletEventTypeMap[T]) => void,
) {
  if (this.eventEmitter) {
    this.eventEmitter.on<T>(eventType, (payload: any) => {
      console.log("cosmos on", payload);

      handler(payload);
    });
  }
}
