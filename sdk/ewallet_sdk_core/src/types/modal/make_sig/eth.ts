import type { Hex, RpcTransactionRequest, SignableMessage } from "viem";

import type { ChainInfoForAttachedModal } from "@keplr-ewallet-sdk-core/types/modal/common";

export interface MakeEthSigModalResult {
  chain_type: "eth";
  sig_result: MakeEthereumSigResult;
}

export type MakeEthereumSigData =
  | MakeTxSignSigData
  | MakeArbitrarySigData
  | MakeEIP712SigData;

export interface MakeTxSignSigData {
  chain_type: "eth";
  sign_type: "tx";
  payload: EthereumTxSignPayload;
}

export interface MakeArbitrarySigData {
  chain_type: "eth";
  sign_type: "arbitrary";
  payload: EthereumArbitrarySignPayload;
}

export interface MakeEIP712SigData {
  chain_type: "eth";
  sign_type: "eip712";
  payload: EthereumEip712SignPayload;
}

export type MakeEthereumSigResult = EthereumTxSignResult;

export type EthereumTxSignResult =
  | {
    type: "signed_transaction";
    signedTransaction: Hex;
  }
  | {
    type: "signature";
    signature: Hex;
  };

export type EthereumTxSignPayload = {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  data: {
    transaction: RpcTransactionRequest;
  };
};

export type EthereumArbitrarySignPayload = {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  data: {
    message: SignableMessage;
  };
};

export type EthereumEip712SignPayload = {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  data: {
    version: "4";
    serialized_typed_data: string;
  };
};

export type MakeEthSigError = {
  type: "unknown_error";
  error: any;
};
