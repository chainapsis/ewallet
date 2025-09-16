import type { StdSignDoc, StdSignature } from "@cosmjs/amino";
import type { KeplrSignOptions } from "@keplr-wallet/types";

import type { SignDoc } from "@keplr-ewallet-sdk-core/types/cosmos_sign";
import type { ChainInfoForAttachedModal } from "./common";

export type MakeCosmosSignType = "tx" | "arbitrary";

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
  signOptions?: KeplrSignOptions;
};

type CosmosTxSignAminoPayload = {
  origin: string;
  chain_info: ChainInfoForAttachedModal;
  signer: string;
  signDoc: StdSignDoc;
  signOptions?: KeplrSignOptions;
};

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
