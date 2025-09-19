export interface OtherModalPayload {
  modal_type: "other";
  modal_id: string;
  data: {};
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

export type OtherModalErrorAckPayload = {
  modal_type: "other";
  modal_id: string;
  type: "error";
  error: string;
};
