export type KeplrEWalletCoreEventHandlerMap =
  | {
      eventName: "_accountsChanged";
      handler: (args: { email: any; publicKey: string }) => void;
    }
  | {
      eventName: "_chainChanged";
      handler: (args: {}) => void;
    };

export type KeplrEWalletCoreEvent =
  | {
      name: "_accountsChanged";
      payload: { email: any; publicKey: string };
    }
  | {
      name: "_chainChanged";
      payload: {};
    };
