import type { MakeCosmosSigResult } from "@oko-wallet/ewallet-sdk-core";

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
