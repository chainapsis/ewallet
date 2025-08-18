export type KeplrEWalletEventType =
  | KeplrWalletCoreEventType
  | KeplrCosmosEWalletEventType;

export type KeplrEWalletEventTypeMap = KeplrCosmosEWalletEventTypeMap;

// export type KeplrWalletCoreEventType = keyof KeplrWalletCoreEventTypeMap;
// export interface KeplrWalletCoreEventTypeMap {
//   _accountsChanged: { email: string; publicKey: string };
//   _chainChanged: {};
//
// }

export type KeplrWalletCoreEventType = "_accountsChanged" | "_chainChanged";

export type KeplrWalletCoreEventHandler<T extends KeplrWalletCoreEventType> =
  T extends "_accountsChanged"
  ? {
    email: string;
    publicKey: string;
  }
  : {};

export type KeplrCosmosEWalletEventType = keyof KeplrCosmosEWalletEventTypeMap;
export interface KeplrCosmosEWalletEventTypeMap {
  accountsChanged: { email: string; publicKey: string };
  chainChanged: {};
}
