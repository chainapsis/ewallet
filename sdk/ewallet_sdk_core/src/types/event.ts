export type KeplrEWalletEventType =
  | KeplrWalletCoreEventType
  | KeplrCosmosEWalletEventType;

export type KeplrEWalletEventTypeMap = KeplrWalletCoreEventTypeMap &
  KeplrCosmosEWalletEventTypeMap;

export type KeplrWalletCoreEventType = keyof KeplrWalletCoreEventTypeMap;
export interface KeplrWalletCoreEventTypeMap {
  _accountsChanged: { email: string; publicKey: string };
  _chainChanged: {};
}

export type KeplrCosmosEWalletEventType = keyof KeplrCosmosEWalletEventTypeMap;
export interface KeplrCosmosEWalletEventTypeMap {
  accountsChanged: { email: string; publicKey: string };
  chainChanged: {};
}
