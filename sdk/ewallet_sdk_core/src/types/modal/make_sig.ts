import type { MakeCosmosSigData, MakeCosmosSigModalResult } from "./cosmos";
import type { MakeEthereumSigData, MakeEthSigModalResult } from "./eth";

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

export interface MakeSigModalRejectAckPayload {
  modal_type: "eth/make_signature" | "cosmos/make_signature";
  modal_id: string;
  type: "reject";
}

export interface MakeSigModalErrorAckPayload {
  modal_type: "eth/make_signature" | "cosmos/make_signature";
  modal_id: string;
  type: "error";
  error: string;
}
