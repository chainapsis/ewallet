export type KeplrWalletCosmosEventMap = {
  accountsChanged: { email: string; publicKey: string };
  chainChanged: {};
};

export type KeplrWalletCosmosEventName = keyof KeplrWalletCosmosEventMap;

export type KeplrWalletCosmosEventPayload =
  KeplrWalletCosmosEventMap[KeplrWalletCosmosEventName];

export type KeplrWalletCosmosEventHandler<
  K extends KeplrWalletCosmosEventName,
> = (payload: KeplrWalletCosmosEventMap[K]) => void;

export type KeplrEWalletCosmosEvent2 =
  | {
      type: "accountsChanged";
      email: string;
      publicKey: string;
    }
  | {
      type: "chainChanged";
    };

export type KeplrEWalletCosmosEventHandler2 =
  | {
      type: "accountsChanged";
      handler: (payload: { email: string; publicKey: string }) => void;
    }
  | {
      type: "chainChanged";
      handler: (payload: void) => void;
    };
