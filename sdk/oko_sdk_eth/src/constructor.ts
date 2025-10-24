import type { KeplrEWalletInterface } from "@oko-wallet/oko-sdk-core";

import type { EthEWalletInterface, EthEWalletStaticInterface } from "./types";
import { lazyInit } from "./private/lazy_init";

export const EthEWallet = function (
  this: EthEWalletInterface,
  eWallet: KeplrEWalletInterface,
) {
  this.eWallet = eWallet;
  this.provider = null;
  this.state = {
    publicKey: null,
    publicKeyRaw: null,
    address: null,
  };
  this.waitUntilInitialized = lazyInit(this).then();
} as any as EthEWalletStaticInterface;
