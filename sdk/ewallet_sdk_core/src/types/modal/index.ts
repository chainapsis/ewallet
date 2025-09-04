import type { MakeCosmosSigData, MakeCosmosSigResult } from "./cosmos";
import type { MakeEthereumSigData, MakeEthereumSigResult } from "./eth";

export type * from "./cosmos";
export type * from "./eth";
export type * from "./common";

export type OpenModalPayload = MakeSignatureModalPayload | OtherModalPayload;

export interface OtherModalPayload {
  modal_type: "other";
  modal_id: string;
  data: {};
}

export type MakeSignatureModalPayload = {
  modal_type: "make_signature";
  modal_id: string;
  data: MakeCosmosSigData | MakeEthereumSigData;
};

export type MakeSignatureModalResult =
  | {
    chain_type: "eth";
    data: MakeEthereumSigResult;
  }
  | {
    chain_type: "cosmos";
    data: MakeCosmosSigResult;
  };

interface MakeSigModalApproveAckPayload {
  modal_type: "make_signature";
  modal_id: string;
  type: "approve";
  data: MakeSignatureModalResult;
}

interface MakeSigModalRejectAckPayload {
  modal_type: "make_signature";
  modal_id: string;
  type: "reject";
}

interface MakeSigModalErrorAckPayload {
  modal_type: "make_signature";
  modal_id: string;
  type: "error";
  err: string;
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
