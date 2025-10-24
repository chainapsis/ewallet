import { KeplrEWallet } from "@oko-wallet/oko-sdk-core";

// declare global {
//   interface Window {
//     // __keplr_ewallet: KeplrEWallet | null | undefined;
//   }
// }

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      SERVER_PORT: string;
      VITE_EWALLET_API_ENDPOINT: string;
      VITE_KS_NODE_API_ENDPOINT: string;
      VITE_KS_NODE_API_ENDPOINT_2: string;
      VITE_DEMO_WEB_ORIGIN: string;
    }
  }
}

// Ensures this file is treated as a module (necessary if esm)
export { };
