import type { KeplrEWalletInterface } from "@keplr-ewallet/ewallet-sdk-core";

import {
  getPublicKey,
  makeSignature,
  getEthereumProvider,
  personalSign,
  switchChain,
  toViemAccount,
  getAddress,
  setUpEventHandlers,
} from "@keplr-ewallet-sdk-eth/methods";
import type { EthEWalletInterface } from "./types";
import { init } from "./static/init";

const USE_TESTNET_DEFAULT = false;

export function EthEWallet(
  this: EthEWalletInterface,
  eWallet: KeplrEWalletInterface,
  useTestnet?: boolean,
) {
  this.eWallet = eWallet;
  this.useTestnet = useTestnet !== undefined ? useTestnet : USE_TESTNET_DEFAULT;
  this.provider = null;
  this.publicKey = null;
  this.address = null;
  this.setUpEventHandlers();
}

EthEWallet.prototype.getEthereumProvider = getEthereumProvider;
EthEWallet.prototype.sign = personalSign;
EthEWallet.prototype.switchChain = switchChain;
EthEWallet.prototype.toViemAccount = toViemAccount;
EthEWallet.prototype.getPublicKey = getPublicKey;
EthEWallet.prototype.getAddress = getAddress;
EthEWallet.prototype.makeSignature = makeSignature;
EthEWallet.prototype.setUpEventHandlers = setUpEventHandlers;

EthEWallet.init = init;
