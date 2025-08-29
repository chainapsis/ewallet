export interface AccountsChangedPayload {
  email: string | null;
  publicKey: string | null;
}

export type KeplrEWalletCoreEvent2 =
  | {
    type: "CORE__accountsChanged";
    email: string | null;
    publicKey: string | null;
  }
  | {
    type: "CORE__chainChanged";
  };

export type KeplrEWalletCoreEventHandler2 =
  | {
    type: "CORE__accountsChanged";
    handler: (payload: AccountsChangedPayload) => void;
  }
  | {
    type: "CORE__chainChanged";
    handler: (payload: void) => void;
  };
