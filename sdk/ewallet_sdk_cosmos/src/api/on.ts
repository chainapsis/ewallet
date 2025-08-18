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
    // TODO: @elden
    // this.eventEmitter.on(eventType, (payload: any) => {
    //   console.log("cosmos on", payload);
    //
    //   handler(payload);
    // });
  }
}
