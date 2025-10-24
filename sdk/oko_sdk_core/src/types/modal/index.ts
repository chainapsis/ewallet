import type {
  MakeSigModalApproveAckPayload,
  MakeSigModalErrorAckPayload,
  MakeSigModalPayload,
  MakeSigModalRejectAckPayload,
} from "./make_sig";
import type {
  OtherModalApproveAckPayload,
  OtherModalErrorAckPayload,
  OtherModalPayload,
  OtherModalRejectAckPayload,
} from "./other";

export * from "./common";
export * from "./other";
export * from "./make_sig";

export type OpenModalPayload = MakeSigModalPayload | OtherModalPayload;

export type OpenModalAckPayload =
  | MakeSigModalApproveAckPayload
  | MakeSigModalRejectAckPayload
  | MakeSigModalErrorAckPayload
  | OtherModalApproveAckPayload
  | OtherModalRejectAckPayload
  | OtherModalErrorAckPayload;
