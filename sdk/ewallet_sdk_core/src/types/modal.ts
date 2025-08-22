import type { RpcTransactionRequest, SignableMessage } from "viem";
import type { StdSignDoc, StdSignature } from "@cosmjs/amino";
import type { Bech32Config, ChainInfo, Msg } from "@keplr-wallet/types";
import type { SignDoc } from "@keplr-ewallet-sdk-core/types/cosmos_sign";

type Any = {
  typeUrl: string;
  value: Uint8Array;
};

type AnyWithUnpacked =
  | Any
  | (Any & {
      unpacked: unknown;
    });

export type ShowModalPayload = MakeSignatureModalPayload | OtherModalPayload;

export type ModalApproval = {
  approved: true;
  data: MakeSignatureModalResult | null;
};

export type ModalRejection = {
  approved: false;
  reason?: string;
};

export type ModalResult = ModalApproval | ModalRejection;

export interface OtherModalPayload {
  modal_type: "other";
  data: {};
}

export type MakeSignatureModalPayload = {
  modal_type: "make_signature";
  data: MakeCosmosSigData | MakeEthereumSigData;
};

export type ChainInfoForAttachedModal = {
  readonly chain_id: string;
  readonly chain_name: string;
  readonly chain_symbol_image_url?: string;
  readonly rpc_url?: string;
  readonly rest_url?: string;
  readonly block_explorer_url?: string;
  readonly fee_currencies?: ChainInfo["feeCurrencies"];
  readonly currencies?: ChainInfo["currencies"];
  readonly bech32_config?: Bech32Config;
};

export type MakeCosmosSignType = MakeCosmosSigData["sign_type"];

export type MakeCosmosSigData =
  | {
      chain_type: "cosmos";
      sign_type: "tx";
      payload: CosmosTxSignPayload;
    }
  | {
      chain_type: "cosmos";
      sign_type: "arbitrary";
      payload: CosmosArbitrarySignPayload;
    };

export type CosmosTxSignPayload =
  | CosmosTxSignDirectPayload
  | CosmosTxSignAminoPayload;

type CosmosTxSignDirectPayload = {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  signDoc: SignDoc;
};
type CosmosTxSignAminoPayload = {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  signDoc: StdSignDoc;
};

export type CosmosArbitrarySignPayload = {
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  data: string | Uint8Array;
  signDoc: StdSignDoc;
  origin: string;
};

export type MakeEthereumSignType = MakeEthereumSigData["sign_type"];

export type MakeEthereumSigData =
  | {
      chain_type: "eth";
      sign_type: "tx";
      payload: EthereumTxSignPayload;
    }
  | {
      chain_type: "eth";
      sign_type: "arbitrary";
      payload: EthereumArbitrarySignPayload;
    }
  | {
      chain_type: "eth";
      sign_type: "eip712";
      payload: EthereumEip712SignPayload;
    };

export type EthereumTxSignPayload = {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  request_id: string;
  data: {
    transaction: RpcTransactionRequest;
  };
};

export type EthereumArbitrarySignPayload = {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  request_id: string;
  data: {
    message: SignableMessage;
  };
};

export type EthereumEip712SignPayload = {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  request_id: string;
  data: {
    version: "4";
    serialized_typed_data: string;
  };
};

export type MakeSignatureModalResult = {
  modal_type: "make_signature";
} & (
  | {
      chain_type: "eth";
      data: MakeEthereumSigResult;
    }
  | {
      chain_type: "cosmos";
      data: MakeCosmosSigResult;
    }
);

export type MakeEthereumSigResult = EthereumTxSignResult;

export type EthereumTxSignResult = {
  transaction: RpcTransactionRequest;
};

// TODO: define the response type for cosmos signature
export type MakeCosmosSigResult = {
  signature: StdSignature;
};
