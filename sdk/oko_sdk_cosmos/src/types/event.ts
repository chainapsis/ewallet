import type { Key } from "@keplr-wallet/types";

export interface AccountChangePayload {
  email: string | null;
  publicKey: Key["pubKey"] | null;
}

export type KeplrEWalletCosmosEvent2 =
  | ({
      type: "accountsChanged";
    } & AccountChangePayload)
  | {
      type: "chainChanged";
    };

export type KeplrEWalletCosmosEventHandler2 =
  | {
      type: "accountsChanged";
      handler: (payload: AccountChangePayload) => void;
    }
  | {
      type: "chainChanged";
      handler: (payload: void) => void;
    };
