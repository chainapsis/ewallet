import {
  CosmosEWallet,
  initCosmosEWallet,
} from "@keplr-ewallet/ewallet-sdk-cosmos";
import { EthEWallet, initEthEWallet } from "@keplr-ewallet/ewallet-sdk-eth";
import { create } from "zustand";
import { combine } from "zustand/middleware";

interface AppState {
  keplr_sdk_eth: EthEWallet | null;
  keplr_sdk_cosmos: CosmosEWallet | null;
  isInitialized: boolean;
  isEthInitializing: boolean;
  isCosmosInitializing: boolean;
}

interface AppActions {
  initKeplrSdkEth: () => EthEWallet | null;
  initKeplrSdkCosmos: () => CosmosEWallet | null;
}

export const useAppState = create(
  combine<AppState, AppActions>(
    {
      keplr_sdk_eth: null,
      keplr_sdk_cosmos: null,
      isInitialized: false,
      isEthInitializing: false,
      isCosmosInitializing: false,
    },
    (set, get) => ({
      initKeplrSdkEth: () => {
        const state = get();

        if (state.keplr_sdk_eth || state.isEthInitializing) {
          console.log(
            "ETH SDK already initialized or initializing, skipping...",
          );
          return state.keplr_sdk_eth;
        }

        console.log("Initializing ETH SDK...");
        set({ isEthInitializing: true });

        const initRes = initEthEWallet({
          // TODO: replace with actual apiKey
          api_key:
            "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
          sdk_endpoint: import.meta.env.VITE_KEPLR_EWALLET_SDK_ENDPOINT,
        });

        if (initRes.success) {
          set({
            keplr_sdk_eth: initRes.data,
            isEthInitializing: false,
          });
          // initRes.data.eWallet.on("_init", (result) => {
          //   if (result.success) {
          //     set({ isInitialized: true });
          //   }
          // });

          return initRes.data;
        } else {
          console.error("sdk init fail, err: %s", initRes.err);
          set({ isEthInitializing: false });

          return null;
        }
      },
      initKeplrSdkCosmos: () => {
        const state = get();

        if (state.keplr_sdk_cosmos || state.isCosmosInitializing) {
          console.log(
            "Cosmos SDK already initialized or initializing, skipping...",
          );
          return state.keplr_sdk_cosmos;
        }

        console.log("Initializing Cosmos SDK...");
        set({ isCosmosInitializing: true });

        const initRes = initCosmosEWallet({
          // TODO: replace with actual apiKey
          api_key:
            "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
          sdk_endpoint: import.meta.env.VITE_KEPLR_EWALLET_SDK_ENDPOINT,
        });

        if (initRes.success) {
          const cosmosSDK = initRes.data;

          set({
            keplr_sdk_cosmos: cosmosSDK,
            isCosmosInitializing: false,
          });

          // cosmosSDK.eWallet.on("_init", (result) => {
          //   if (result.success) {
          //     set({ isInitialized: true });
          //   }
          // });

          cosmosSDK.on("accountsChanged", async (payload: any) => {
            console.log("ev - accountsChanged", payload);

            // set({
            //   userInfo: payload,
            // });
          });

          return initRes.data;
        } else {
          console.error("sdk init fail, err: %s", initRes.err);
          set({ isCosmosInitializing: false });

          return null;
        }
      },
    }),
  ),
);
