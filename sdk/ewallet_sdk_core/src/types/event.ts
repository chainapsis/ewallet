export type KeplrWalletCoreEventHandlerMap =
  | {
    eventName: "_accountsChanged";
    handler: (args: { email: any; publicKey: string }) => void;
  }
  | {
    eventName: "_chainChanged";
    handler: (args: {}) => void;
  };
