import type { CosmosEWallet } from "@keplr-ewallet-sdk-cosmos/cosmos_ewallet";
import type {
  KeplrWalletCosmosEventName,
  KeplrWalletCosmosEventHandler,
  KeplrWalletCosmosOn,
} from "@keplr-ewallet-sdk-cosmos/types";

async function _on<N extends KeplrWalletCosmosEventName>(
  this: CosmosEWallet,
  eventName: N,
  handler: KeplrWalletCosmosEventHandler<N>,
) {
  if (this.eventEmitter) {
    this.eventEmitter.on(eventName, handler);
  }
}

export const on = _on as KeplrWalletCosmosOn;
