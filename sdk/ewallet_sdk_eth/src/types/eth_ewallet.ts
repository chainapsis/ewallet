import type {
  KeplrEwalletInitArgs,
  KeplrEWalletInterface,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Address, Hex } from "viem";
import type { Result } from "@keplr-ewallet/stdlib-js";

import type { EWalletEIP1193Provider } from "@keplr-ewallet-sdk-eth/provider";
import type { EWalletAccount } from "./account";
import type { EthSignParams, EthSignResult } from "./sign";
import type { LazyInitError } from "@keplr-ewallet-sdk-eth/errors";

export interface EthEWalletState {
  publicKey: Hex | null;
  address: Address | null;
  publicKeyRaw: string | null;
}

export interface EthEWalletInterface {
  state: EthEWalletState;
  eWallet: KeplrEWalletInterface;
  useTestnet: boolean;
  provider: EWalletEIP1193Provider | null;
  waitUntilInitialized: Promise<Result<EthEWalletState, LazyInitError>>;

  getEthereumProvider: () => EWalletEIP1193Provider;
  sign: (message: string) => Promise<Hex>;
  switchChain: (chainId: Hex | number) => Promise<void>;
  toViemAccount: () => Promise<EWalletAccount>;
  getPublicKey: () => Promise<Hex>;
  getAddress: () => Promise<Hex>;
  makeSignature: (params: EthSignParams) => Promise<EthSignResult>;
}

export type EthEWalletInitArgs = KeplrEwalletInitArgs & {
  use_testnet?: boolean; // TODO: replace with chain param
};
