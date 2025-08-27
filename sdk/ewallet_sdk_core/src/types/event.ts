import type { Result } from "@keplr-ewallet/stdlib-js";

export interface InitEventPayload {
  email: string | null;
  publicKey: string | null;
}

export type KeplrEWalletCoreEvent2 =
  | {
      type: "CORE__accountsChanged";
      email: string;
      publicKey: string;
    }
  | {
      type: "CORE__chainChanged";
    };

export type KeplrEWalletCoreEventHandler2 =
  | {
      type: "CORE__accountsChanged";
      handler: (payload: InitEventPayload) => void;
    }
  | {
      type: "CORE__chainChanged";
      handler: (payload: void) => void;
    };
