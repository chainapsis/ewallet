export type KeplrEWalletEventType =
  | KeplrWalletCoreEventType
  | KeplrCosmosEWalletEventType;

export type KeplrEWalletEventTypeMap = KeplrWalletCoreEventTypeMap &
  KeplrCosmosEWalletEventTypeMap;

export type KeplrWalletCoreEventType = keyof KeplrWalletCoreEventTypeMap;
export interface KeplrWalletCoreEventTypeMap {
  accountsChanged: { email: string; publicKey: string };
  chainChanged: {};
}

export type KeplrCosmosEWalletEventType = keyof KeplrCosmosEWalletEventTypeMap;
export interface KeplrCosmosEWalletEventTypeMap {
  keyringChanged: { email: string; publicKey: string };
  chainChanged: {};
}
