import type { StdSignDoc, StdSignature } from "@cosmjs/amino";
import type { KeplrSignOptions } from "@keplr-wallet/types";

import type { SignDoc } from "@keplr-ewallet-sdk-core/types/cosmos_sign";
import type { ChainInfoForAttachedModal } from "@keplr-ewallet-sdk-core/types/modal/common";

export type MakeCosmosSigData = CosmosTxSigData | CosmosArbitrarySigData;

export interface MakeCosmosSigModalResult {
  chain_type: "cosmos";
  sig_result: MakeCosmosSigResult;
}

export interface CosmosTxSigData {
  chain_type: "cosmos";
  sign_type: "tx";
  payload: CosmosTxSignPayload;
}

export interface CosmosArbitrarySigData {
  chain_type: "cosmos";
  sign_type: "arbitrary";
  payload: CosmosArbitrarySignPayload;
}

export type CosmosTxSignPayload =
  | CosmosTxSignDirectPayload
  | CosmosTxSignAminoPayload;

export interface CosmosTxSignDirectPayload {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  signDoc: SignDoc;
  signOptions?: KeplrSignOptions;
}

export interface CosmosTxSignAminoPayload {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  signDoc: StdSignDoc;
  signOptions?: KeplrSignOptions;
}

export type CosmosArbitrarySignPayload = {
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  data: string | Uint8Array;
  signDoc: StdSignDoc;
  origin: string;
};

export type MakeCosmosSigResult = {
  signature: StdSignature;
  signed: StdSignDoc | SignDoc;
};

export type MakeCosmosSigError =
  | {
      type: "unknown_error";
      error: any;
    }
  | {
      type: "COSMOS_SIGN_DOC_PARSE_ERROR";
      error: any;
    };
