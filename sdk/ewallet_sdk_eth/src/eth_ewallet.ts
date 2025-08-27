import type { KeplrEWalletInterface } from "@keplr-ewallet/ewallet-sdk-core";

import {
  getPublicKey,
  makeSignature,
  getEthereumProvider,
  personalSign,
  switchChain,
  toViemAccount,
  getAddress,
  lazyInit,
} from "@keplr-ewallet-sdk-eth/methods";
import type { EthEWalletInterface } from "./types";
import { init, initAsync } from "./static/init";

const USE_TESTNET_DEFAULT = false;

export function EthEWallet(
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
  this.waitUntilInitialized = this.lazyInit().then();
}

EthEWallet.init = init;
EthEWallet.initAsync = initAsync;

const ptype: EthEWalletInterface = EthEWallet.prototype;

ptype.getEthereumProvider = getEthereumProvider;
ptype.sign = personalSign;
ptype.switchChain = switchChain;
ptype.toViemAccount = toViemAccount;
ptype.getPublicKey = getPublicKey;
ptype.getAddress = getAddress;
ptype.makeSignature = makeSignature;
ptype.lazyInit = lazyInit;
