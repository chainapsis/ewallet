import {
  EventEmitter3,
  type KeplrEWalletInterface,
} from "@oko-wallet/ewallet-sdk-core";

import type {
  CosmosEWalletInterface,
  CosmosEWalletStaticInterface,
  KeplrEWalletCosmosEvent2,
  KeplrEWalletCosmosEventHandler2,
} from "@oko-wallet-sdk-cosmos/types";
import { lazyInit } from "./private/lazy_init";

export const CosmosEWallet = function (
  this: CosmosEWalletInterface,
  eWallet: KeplrEWalletInterface,
) {
  this.eWallet = eWallet;
  this.eventEmitter = new EventEmitter3<
    KeplrEWalletCosmosEvent2,
    KeplrEWalletCosmosEventHandler2
  >();
  this.state = {
    publicKey: null,
    publicKeyRaw: null,
  };
  this.waitUntilInitialized = lazyInit(this).then();
} as any as CosmosEWalletStaticInterface;
