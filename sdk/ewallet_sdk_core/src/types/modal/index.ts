import type { MakeCosmosSigData, MakeCosmosSigResult } from "./cosmos";
import type { MakeEthereumSigData, MakeEthereumSigResult } from "./eth";

export type * from "./cosmos";
export type * from "./eth";
export type * from "./common";

export type OpenModalPayload = MakeSigModalPayload | OtherModalPayload;

export interface OtherModalPayload {
  modal_type: "other";
  modal_id: string;
  data: {};
}

export type MakeSigModalPayload =
  | {
    modal_type: "cosmos/make_signature";
    modal_id: string;
    data: MakeCosmosSigData;
  }
  | {
    modal_type: "eth/make_signature";
    modal_id: string;
    data: MakeEthereumSigData;
  };

// export type MakeSignatureModalResult =
//   | MakeEthSigModalResult
//   | MakeCosmosSigModalResult;
//
export interface MakeEthSigModalResult {
  chain_type: "eth";
  sig_result: MakeEthereumSigResult;
}

export interface MakeCosmosSigModalResult {
  chain_type: "cosmos";
  sig_result: MakeCosmosSigResult;
}

export type MakeSigModalApproveAckPayload =
  | {
    modal_type: "cosmos/make_signature";
    modal_id: string;
    type: "approve";
    data: MakeCosmosSigModalResult;
  }
  | {
    modal_type: "eth/make_signature";
    modal_id: string;
    type: "approve";
    data: MakeEthSigModalResult;
  };

interface MakeSigModalRejectAckPayload {
  modal_type: "eth/make_signature" | "cosmos/make_signature";
  modal_id: string;
  type: "reject";
}

interface MakeSigModalErrorAckPayload {
  modal_type: "eth/make_signature" | "cosmos/make_signature";
  modal_id: string;
  type: "error";
  error: string;
}

export type OtherModalApproveAckPayload = {
  modal_type: "other";
  modal_id: string;
  type: "approve";
  data: any;
};

export type OtherModalRejectAckPayload = {
  modal_type: "other";
  modal_id: string;
  type: "reject";
};

export type OpenModalAckPayload =
  | MakeSigModalApproveAckPayload
  | MakeSigModalRejectAckPayload
  | MakeSigModalErrorAckPayload
  | OtherModalApproveAckPayload
  | OtherModalRejectAckPayload;
