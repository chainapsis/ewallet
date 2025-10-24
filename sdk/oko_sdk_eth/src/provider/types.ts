import type { Address, AddEthereumChainParameter, RpcError } from "viem";
import type { AppCurrency, BIP44, EVMInfo } from "@keplr-wallet/types";

import type {
  RpcMethod,
  RpcRequestArgs,
  RpcResponseData,
} from "@oko-wallet-sdk-eth/rpc";
import type { EthSigner } from "@oko-wallet-sdk-eth/types";
import type { ProviderEventEmitter } from "./emitter";

export interface ProviderConnectInfo {
  chainId: string;
}

export type ProviderEventMap = {
  connect: ProviderConnectInfo;
  disconnect: RpcError;
  chainChanged: string;
  accountsChanged: Address[];
};

export type ProviderEvent = keyof ProviderEventMap;

export type ProviderEventHandlers = {
  connect: (info: ProviderConnectInfo) => void;
  disconnect: (error: RpcError) => void;
  chainChanged: (chainId: string) => void;
  accountsChanged: (accounts: Address[]) => void;
};

export type ProviderEventHandler<K extends ProviderEvent> = (
  payload: ProviderEventMap[K],
) => void;

export interface EIP1193Provider extends ProviderEventEmitter {
  request<M extends RpcMethod>(
    args: RpcRequestArgs<M>,
  ): Promise<RpcResponseData<M>>;
}

export type RpcChain = AddEthereumChainParameter;

export type EWalletRpcChain = RpcChain & {
  readonly chainSymbolImageUrl?: string;
  readonly currencies?: AppCurrency[];
  readonly bip44?: BIP44;
  readonly features?: string[];
  readonly evm?: EVMInfo;
};

export type EWalletRpcChainWithStatus = EWalletRpcChain & {
  connected: boolean;
};

export type EWalletEIP1193ProviderOptions = {
  chains: EWalletRpcChain[];
  signer?: EthSigner;
};
