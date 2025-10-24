import type {
  CosmosEWalletInterface,
  KeplrEWalletCosmosEventHandler2,
} from "@oko-wallet-sdk-cosmos/types";

export async function on(
  this: CosmosEWalletInterface,
  handlerDef: KeplrEWalletCosmosEventHandler2,
) {
  this.eventEmitter.on(handlerDef);
}
