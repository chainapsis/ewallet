import type {
  KeplrEWalletCoreEventHandler2,
  KeplrEWalletInterface,
} from "@oko-wallet-sdk-core/types";

export function on(
  this: KeplrEWalletInterface,
  handlerDef: KeplrEWalletCoreEventHandler2,
) {
  this.eventEmitter.on(handlerDef);
}
