export interface AccountChangePayload {
  email: string | null;
  publicKey: Buffer<ArrayBuffer> | null;
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
