import type { Result } from "@keplr-ewallet/stdlib-js";

export type KeplrEWalletCoreEventMap = {
  _accountsChanged: { email: string; publicKey: string };
  _chainChanged: {};
  _init: Result<
    {
      publicKey: string | null;
    },
    string
  >;
};

export type KeplrEWalletCoreEventName = keyof KeplrEWalletCoreEventMap;

export type KeplrEWalletCoreEventPayload =
  KeplrEWalletCoreEventMap[KeplrEWalletCoreEventName];

export type KeplrEWalletCoreEventHandler<K extends KeplrEWalletCoreEventName> =
  (payload: KeplrEWalletCoreEventMap[K]) => void;

export type KeplrEWalletCoreOn = <N extends KeplrEWalletCoreEventName>(
  eventName: N,
  handler: KeplrEWalletCoreEventHandler<N>,
) => void;
