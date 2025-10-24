import { KeplrEWallet } from "@oko-wallet/oko-sdk-core";

declare global {
  interface Window {
    __keplr_ewallet: KeplrEWallet | null | undefined;
  }
}

export {}; // Ensures this file is treated as a module
