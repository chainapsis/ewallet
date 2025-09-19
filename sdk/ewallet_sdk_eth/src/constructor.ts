import type { KeplrEWalletInterface } from "@keplr-ewallet/ewallet-sdk-core";

import type { EthEWalletInterface, EthEWalletStaticInterface } from "./types";
import { lazyInit } from "./private/lazy_init";

const USE_TESTNET_DEFAULT = false;

export const EthEWallet = function (
  this: EthEWalletInterface,
  eWallet: KeplrEWalletInterface,
  useTestnet?: boolean,
) {
  this.eWallet = eWallet;
  this.useTestnet = useTestnet !== undefined ? useTestnet : USE_TESTNET_DEFAULT;
  this.provider = null;
  this.state = {
    publicKey: null,
    publicKeyRaw: null,
    address: null,
  };
  this.waitUntilInitialized = lazyInit(this).then();
} as any as EthEWalletStaticInterface;
