import type { KeplrEWallet } from "./keplr_ewallet";

declare global {
  interface Window {
    __keplr_ewallet: KeplrEWallet | null | undefined;
    __keplr_ewallet_lock: boolean;
    __keplr_ewallet_ev: ((ev: MessageEvent) => void) | null | undefined;
  }
}

export {}; // Ensures this file is treated as a module
