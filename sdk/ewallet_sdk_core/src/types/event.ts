import type { Result } from "@keplr-ewallet/stdlib-js";
import type { InitResult } from "./ewallet";

export type KeplrEWalletCoreEventHandlerMap =
  | {
      eventName: "_accountsChanged";
      handler: (args: { email: any; publicKey: string }) => void;
    }
  | {
      eventName: "_chainChanged";
      handler: (args: {}) => void;
    }
  | {
      eventName: "_init";
      handler: (args: Result<InitResult, string>) => void;
    };

export type KeplrEWalletCoreEvent =
  | {
      name: "_accountsChanged";
      payload: { email: any; publicKey: string };
    }
  | {
      name: "_chainChanged";
      payload: {};
    }
  | {
      name: "_init";
      payload: Result<InitResult, string>;
    };
