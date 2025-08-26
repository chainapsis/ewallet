import type { MakeCosmosSigResult } from "@keplr-ewallet/ewallet-sdk-core";

export type ShowModalResult =
  | {
      approved: true;
      data: MakeCosmosSigResult;
    }
  | {
      approved: false;
      reason?: string;
    };
