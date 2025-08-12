import { EthEWallet, initEthEWallet } from "@keplr-ewallet/ewallet-sdk-eth";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

const STORAGE_KEY = "ewallet-sandbox-evm";

interface AppState {
  keplr_sdk_eth: EthEWallet | null;
}

interface AppActions {
  initKeplrSdkEth: () => Promise<boolean>;
}

export const useAppState = create(
  persist(
    combine<AppState, AppActions>(
      {
        keplr_sdk_eth: null,
      },
      (set) => ({
        initKeplrSdkEth: async () => {
          try {
            const sdk = await initEthEWallet({
              api_key:
                "e4f7b8a2915e40f3b81ad6b6f7c20de76d9b3a1b5c6a401ce36d2e9d0f9b2f8c", // TODO: replace with actual apiKey
              sdk_endpoint: process.env.NEXT_PUBLIC_KEPLR_EWALLET_SDK_ENDPOINT,
            });

            if (sdk) {
              set({ keplr_sdk_eth: sdk });
              return true;
            } else {
              return false;
            }
          } catch (error) {
            console.error("eth sdk init fail");
            return false;
          }
        },
      }),
    ),
    { name: STORAGE_KEY },
  ),
);
