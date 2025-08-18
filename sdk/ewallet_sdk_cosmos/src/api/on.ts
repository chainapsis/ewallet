import type { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import type { KeplrWalletCosmosEventHandlerMap } from "@keplr-ewallet-sdk-cosmos/types";

export async function on<
  N extends KeplrWalletCosmosEventHandlerMap["eventName"],
  M extends { eventName: N } & KeplrWalletCosmosEventHandlerMap,
>(this: CosmosEWallet, eventName: N, handler: M["handler"]) {
  if (this.eventEmitter) {
    this.eventEmitter.on(eventName, (payload: any) => {
      console.log("cosmos on", eventName, payload);

      handler(payload);
    });
  }
}
