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
// EthEWallet.prototype.waitUntilInitialized = waitUntilInitialized;
EthEWallet.prototype.makeSignature = makeSignature;
EthEWallet.prototype.setUpEventHandlers = setUpEventHandlers;

EthEWallet.init = init;
EthEWallet.initAsync = initAsync;

// export class EthEWallet2 {
//   readonly eWallet: KeplrEWalletInterface;
//
//   readonly useTestnet: boolean;
//
//   private _provider: EWalletEIP1193Provider | null;
//   private _publicKey: Hex | null;
//   private _address: Address | null;
//
//   constructor(eWallet: KeplrEWalletInterface, useTestnet: boolean = false) {
//     this.eWallet = eWallet;
//     this.useTestnet = useTestnet;
//     this._provider = null;
//     this._publicKey = null;
//     this._address = null;
//     this.setUpEventHandlers();
//   }
//
//   get type(): "ethereum" {
//     return "ethereum";
//   }
//
//   get chainId(): `eip155:${number}` {
//     if (!this._provider) {
//       return `eip155:${1}`;
//     }
//
//     return `eip155:${parseInt(this._provider.chainId, 16)}`;
//   }
//
//   // get isInitialized(): boolean {
//   //   return this.eWallet.isInitialized;
//   // }
//
//   get publicKey(): Hex | null {
//     return this._publicKey;
//   }
//
//   protected set publicKey(publicKey: Hex | null) {
//     this._publicKey = publicKey;
//   }
//
//   get address(): Address | null {
//     return this._address;
//   }
//
//   protected set address(address: Address | null) {
//     this._address = address;
//   }
//
//   protected get provider(): EWalletEIP1193Provider | null {
//     return this._provider;
//   }
//
//   protected set provider(provider: EWalletEIP1193Provider | null) {
//     this._provider = provider;
//   }
//
//   // getEthereumProvider = getEthereumProvider.bind(this);
//   // sign = personalSign.bind(this);
//   // switchChain = switchChain.bind(this);
//   // toViemAccount = toViemAccount.bind(this);
//   // getPublicKey = getPublicKey.bind(this);
//   // getAddress = getAddress.bind(this);
//   // waitUntilInitialized = waitUntilInitialized.bind(this);
//   // protected makeSignature = makeSignature.bind(this);
//   // protected setUpEventHandlers = setUpEventHandlers.bind(this);
// }
