export type KeplrEWalletEventType = keyof KeplrEWalletEventTypeMap;

export interface KeplrEWalletEventTypeMap {
  accountsChanged: { email: string; publicKey: string };
  chainChanged: {};
}
