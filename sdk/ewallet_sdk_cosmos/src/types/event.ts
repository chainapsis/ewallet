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

export type KeplrWalletCosmosOn = <N extends KeplrWalletCosmosEventName>(
  eventName: N,
  handler: KeplrWalletCosmosEventHandler<N>,
) => void;
