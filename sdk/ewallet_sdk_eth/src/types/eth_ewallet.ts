import type {
  KeplrEwalletInitArgs,
  KeplrEWalletInterface,
} from "@oko-wallet/ewallet-sdk-core";
import type { Address, Hex } from "viem";
import type { Result } from "@oko-wallet/stdlib-js";

import type { EWalletEIP1193Provider } from "@oko-wallet-sdk-eth/provider";
import type { EWalletAccount } from "./account";
import type { EthSignParams, EthSignResult } from "./sign";
import type {
  EthEwalletInitError,
  LazyInitError,
} from "@oko-wallet-sdk-eth/errors";

export interface EthEWalletState {
  publicKey: Hex | null;
  address: Address | null;
  publicKeyRaw: string | null;
}

export type EthEWalletInitArgs = KeplrEwalletInitArgs;

export interface EthEWalletStaticInterface {
  new (eWallet: KeplrEWalletInterface): void;
  init: (
    args: EthEWalletInitArgs,
  ) => Result<EthEWalletInterface, EthEwalletInitError>;
}

export interface EthEWalletInterface {
  state: EthEWalletState;
  eWallet: KeplrEWalletInterface;
  provider: EWalletEIP1193Provider | null;
  waitUntilInitialized: Promise<Result<EthEWalletState, LazyInitError>>;

  getEthereumProvider: () => Promise<EWalletEIP1193Provider>;
  sign: (message: string) => Promise<Hex>;
  switchChain: (chainId: Hex | number) => Promise<void>;
  toViemAccount: () => Promise<EWalletAccount>;
  getPublicKey: () => Promise<Hex>;
  getAddress: () => Promise<Hex>;
  makeSignature: (params: EthSignParams) => Promise<EthSignResult>;
}
