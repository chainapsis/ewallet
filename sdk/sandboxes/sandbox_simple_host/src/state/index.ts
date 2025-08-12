import {
  CosmosEWallet,
  initCosmosEWallet,
} from "@keplr-ewallet/ewallet-sdk-cosmos";
import { EthEWallet, initEthEWallet } from "@keplr-ewallet/ewallet-sdk-eth";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

const STORAGE_KEY = "sandbox-simple-host";

interface AppState {
  keplr_sdk_eth: EthEWallet | null;
  keplr_sdk_cosmos: CosmosEWallet | null;
}

interface AppActions {
  initKeplrSdkEth: () => Promise<boolean>;
  initKeplrSdkCosmos: () => Promise<boolean>;
}

export const useAppState = create(
  persist(
    combine<AppState, AppActions>(
      {
        keplr_sdk_eth: null,
        keplr_sdk_cosmos: null,
      },
      (set) => ({
        initKeplrSdkEth: async () => {
          const sdk = await initEthEWallet({
            api_key:
              "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c", // TODO: replace with actual apiKey
            sdk_endpoint: import.meta.env.VITE_KEPLR_EWALLET_SDK_ENDPOINT,
          });

          if (sdk) {
            set({ keplr_sdk_eth: sdk });
            return true;
          } else {
            console.error("sdk init fail");
            return false;
          }
        },
        initKeplrSdkCosmos: async () => {
          const sdk = await initCosmosEWallet({
            api_key:
              "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c", // TODO: replace with actual apiKey
            sdk_endpoint: import.meta.env.VITE_KEPLR_EWALLET_SDK_ENDPOINT,
          });

          if (sdk) {
            set({ keplr_sdk_cosmos: sdk });
            return true;
          } else {
            console.error("sdk init fail");
            return false;
          }
        },
      }),
    ),
    { name: STORAGE_KEY },
  ),
);
