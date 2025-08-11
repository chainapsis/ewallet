import type { ModalApproval } from "@keplr-ewallet/ewallet-sdk-core";

export type HideModalFn = ({
  result,
  data,
  error,
}: {
  result: "approve" | "reject" | "error";
  data?: ModalApproval["data"];
  error?: string;
}) => void;
