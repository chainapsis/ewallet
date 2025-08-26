import type { Result } from "@keplr-ewallet/stdlib-js";

export type KeplrEWalletCoreEventMap = {
  _accountsChanged: { email: string; publicKey: string };
  _chainChanged: {};
  _init: Result<
    {
      email: string | null;
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
