import type { MakeCosmosSigResult } from "@keplr-ewallet/ewallet-sdk-core";

export type OpenModalResult =
  | {
    approved: true;
    modal_id: string;
    data: MakeCosmosSigResult;
  }
  | {
    approved: false;
    modal_id: string;
    reason?: string;
  };
