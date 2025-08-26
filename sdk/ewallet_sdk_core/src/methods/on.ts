import type {
  KeplrEWalletCoreEventHandler2,
  KeplrEWalletInterface,
} from "@keplr-ewallet-sdk-core/types";

export async function on(
  this: KeplrEWalletInterface,
  handlerDef: KeplrEWalletCoreEventHandler2,
) {
  await this.waitUntilInitialized;

  this.eventEmitter.on(handlerDef);
}
