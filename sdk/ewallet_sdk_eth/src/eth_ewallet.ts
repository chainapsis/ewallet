import type { KeplrEWallet } from "@keplr-ewallet/ewallet-sdk-core";
import { isAddress, type Address, type Hex } from "viem";

import type { EWalletEIP1193Provider } from "@keplr-ewallet-sdk-eth/provider";
import {
  getPublicKey,
  makeSignature,
  getEthereumProvider,
  personalSign,
  switchChain,
  toViemAccount,
  getAddress,
} from "@keplr-ewallet-sdk-eth/api";
import { publicKeyToEthereumAddress } from "@keplr-ewallet-sdk-eth/utils";

export class EthEWallet {
  readonly eWallet: KeplrEWallet;
  private _provider: EWalletEIP1193Provider | null;
  private _publicKey: Hex | null;
  private _address: Address | null;

  constructor(eWallet: KeplrEWallet) {
    this.eWallet = eWallet;
    this._provider = null;
    this._publicKey = null;
    this._address = null;

    this.eWallet.on("_accountsChanged", (payload: { publicKey: string }) => {
      console.log(
        "[keplr-ewallet-sdk-eth] _accountsChanged",
        payload,
        this._publicKey,
        this._address,
      );

      if (this._provider) {
        if (payload.publicKey) {
          let publicKeyHex: Hex;
          if (payload.publicKey.startsWith("0x")) {
            publicKeyHex = payload.publicKey as Hex;
          } else {
            publicKeyHex = `0x${payload.publicKey}`;
          }

          try {
            const address = publicKeyToEthereumAddress(publicKeyHex);
            if (isAddress(address)) {
              this._publicKey = publicKeyHex;
              this._address = address;
              this._provider.emit("accountsChanged", [address]);
            }
          } catch (e) {
            console.error(
              "[keplr-ewallet-sdk-eth] failed to get account from public key",
              e,
            );
            this._publicKey = null;
            this._address = null;
            this._provider.emit("accountsChanged", []);
          }
        } else {
          this._publicKey = null;
          this._address = null;
          this._provider.emit("accountsChanged", []);
        }
      }
    });
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

  get publicKey(): Hex | null {
    return this._publicKey;
  }

  protected set publicKey(publicKey: Hex) {
    this._publicKey = publicKey;
  }

  get address(): Address | null {
    return this._address;
  }

  protected set address(address: Address) {
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
  protected makeSignature = makeSignature.bind(this);
}
