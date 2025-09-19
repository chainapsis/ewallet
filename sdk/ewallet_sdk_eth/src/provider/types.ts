import type {
  Address,
  AddEthereumChainParameter as RpcChain,
  RpcError,
} from "viem";

import type {
  RpcMethod,
  RpcRequestArgs,
  RpcResponseData,
} from "@keplr-ewallet-sdk-eth/rpc";
import type { EthSigner } from "@keplr-ewallet-sdk-eth/types";
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

export type RpcChainWithStatus = RpcChain & {
  connected: boolean;
};

export type EWalletEIP1193ProviderOptions = {
  chains: RpcChain[];
  signer?: EthSigner;
};
