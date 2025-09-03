import type { KeplrEWalletInterface } from "./types";

declare global {
  interface Window {
    __keplr_ewallet: KeplrEWalletInterface | null | undefined;
    __keplr_ewallet_locked: boolean;
    __keplr_ewallet_ev: ((ev: MessageEvent) => void) | null | undefined;
  }
}

export { };
