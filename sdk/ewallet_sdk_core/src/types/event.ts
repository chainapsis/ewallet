import type { Result } from "@keplr-ewallet/stdlib-js";

export interface InitPayload {
  email: string | null;
  publicKey: string | null;
}

export type KeplrEWalletCoreEvent2 =
  | {
      type: "CORE__accountsChanged";
      email: string;
      publicKey: string;
    }
  | {
      type: "CORE__chainChanged";
    }
  | ({
      type: "CORE__init";
    } & Result<InitPayload, string>);

export type KeplrEWalletCoreEventHandler2 =
  | {
      type: "CORE__accountsChanged";
      handler: (payload: InitPayload) => void;
    }
  | {
      type: "CORE__chainChanged";
      handler: (payload: void) => void;
    }
  | {
      type: "CORE__init";
      handler: (payload: Result<InitPayload, string>) => void;
    };

// export type KeplrEWalletCoreEventMap = {
//   _accountsChanged: { email: string; publicKey: string };
//   _chainChanged: {};
//   _init: Result<
//     {
//       email: string | null;
//       publicKey: string | null;
//     },
//     string
//   >;
// };
//
// export type KeplrEWalletCoreEventName = keyof KeplrEWalletCoreEventMap;
//
// export type KeplrEWalletCoreEventPayload =
//   KeplrEWalletCoreEventMap[KeplrEWalletCoreEventName];
//
// export type KeplrEWalletCoreEventHandler<K extends KeplrEWalletCoreEventName> =
//   (payload: KeplrEWalletCoreEventMap[K]) => void;
