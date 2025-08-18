export type KeplrEWalletEventType = KeplrCosmosEWalletEventType;

export type KeplrEWalletEventTypeMap = KeplrCosmosEWalletEventTypeMap;

export interface EventEmitterEventMap {
  eventType: string;
  payload: any;
}

export type KeplrWalletCoreEventNames = "_accountsChanged" | "_chainChanged";

export type KeplrWalletCoreEventHandlerMap =
  | {
      eventName: "_accountsChanged";
      handler: (args: { email: any; publicKey: string }) => void;
    }
  | {
      eventName: "_chainChanged";
      handler: (args: {}) => void;
    };

export type KeplrCosmosEWalletEventType = keyof KeplrCosmosEWalletEventTypeMap;
export interface KeplrCosmosEWalletEventTypeMap {
  accountsChanged: { email: string; publicKey: string };
  chainChanged: {};
}
