export type KeplrWalletCosmosEventNames =
  KeplrWalletCosmosEventHandlerMap["eventName"];

export type KeplrWalletCosmosEventHandlerMap =
  | {
    eventName: "accountsChanged";
    handler: (args: { email: any; publicKey: string }) => void;
  }
  | {
    eventName: "chainChanged";
    handler: (args: {}) => void;
  };
