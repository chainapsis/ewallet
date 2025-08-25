import type {
  KeplrEwalletInitArgs,
  KeplrEWalletInterface,
} from "@keplr-ewallet/ewallet-sdk-core";
import type { Address, Hex } from "viem";

import type { EWalletEIP1193Provider } from "@keplr-ewallet-sdk-eth/provider";
import type { EthSignFunction, EthSignParams, EthSignResult } from ".";

export interface EthEWalletInterface {
  eWallet: KeplrEWalletInterface;
  useTestnet: boolean;

  provider: EWalletEIP1193Provider | null;
  publicKey: Hex | null;
  address: Address | null;

  getEthereumProvider: () => Promise<EWalletEIP1193Provider>;
  sign: (message: string) => Promise<Hex>;
  switchChain: (chainId: Hex | number) => Promise<void>;
  toViemAccount: () => Promise<any>;
  getPublicKey: () => Promise<Hex>;
  getAddress: () => Promise<Hex>;
  waitUntilInitialized: () => Promise<void>;
  makeSignature: <P extends EthSignParams>(
    parameters: P,
  ) => Promise<EthSignResult<P>>;
  setUpEventHandlers: () => void;
}

export type EthEWalletInitArgs = KeplrEwalletInitArgs & {
  use_testnet?: boolean; // TODO: replace with chain param
};
