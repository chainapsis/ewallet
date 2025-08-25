import type {
  KeplrEWallet,
  KeplrEWalletInterface,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Address, Hex } from "viem";

import type { EWalletEIP1193Provider } from "@keplr-ewallet-sdk-eth/provider";
import {
  getPublicKey,
  makeSignature,
  getEthereumProvider,
  personalSign,
  switchChain,
  toViemAccount,
  getAddress,
  setUpEventHandlers,
  waitUntilInitialized,
} from "@keplr-ewallet-sdk-eth/methods";

export class EthEWallet {
  readonly eWallet: KeplrEWalletInterface;

  readonly useTestnet: boolean;

  private _provider: EWalletEIP1193Provider | null;
  private _publicKey: Hex | null;
  private _address: Address | null;

  constructor(eWallet: KeplrEWalletInterface, useTestnet: boolean = false) {
    this.eWallet = eWallet;
    this.useTestnet = useTestnet;
    this._provider = null;
    this._publicKey = null;
    this._address = null;
    this.setUpEventHandlers();
  }

  get type(): "ethereum" {
    return "ethereum";
  }

  get chainId(): `eip155:${number}` {
    if (!this._provider) {
      return `eip155:${1}`;
    }

    return `eip155:${parseInt(this._provider.chainId, 16)}`;
  }

  // get isInitialized(): boolean {
  //   return this.eWallet.isInitialized;
  // }

  get publicKey(): Hex | null {
    return this._publicKey;
  }

  protected set publicKey(publicKey: Hex | null) {
    this._publicKey = publicKey;
  }

  get address(): Address | null {
    return this._address;
  }

  protected set address(address: Address | null) {
    this._address = address;
  }

  protected get provider(): EWalletEIP1193Provider | null {
    return this._provider;
  }

  protected set provider(provider: EWalletEIP1193Provider | null) {
    this._provider = provider;
  }

  getEthereumProvider = getEthereumProvider.bind(this);
  sign = personalSign.bind(this);
  switchChain = switchChain.bind(this);
  toViemAccount = toViemAccount.bind(this);
  getPublicKey = getPublicKey.bind(this);
  getAddress = getAddress.bind(this);
  waitUntilInitialized = waitUntilInitialized.bind(this);
  protected makeSignature = makeSignature.bind(this);
  protected setUpEventHandlers = setUpEventHandlers.bind(this);
}
