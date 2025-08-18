import type { KeplrCosmosEWalletEventTypeMap } from "@keplr-ewallet/ewallet-sdk-core";
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
  userInfo: {
    email: string;
    publicKey: string;
  } | null;
  ethAddress: string | null;
  cosmosAddress: string | null;
}

interface AppActions {
  initKeplrSdkEth: () => Promise<EthEWallet | null>;
  initKeplrSdkCosmos: () => Promise<CosmosEWallet | null>;
  setUserInfo: (userInfo: { email: string; publicKey: string }) => void;
  setEthAddress: (ethAddress: string) => void;
  setCosmosAddress: (cosmosAddress: string) => void;
}

export const useAppState = create(
  combine<AppState, AppActions>(
    {
      keplr_sdk_eth: null,
      keplr_sdk_cosmos: null,
      ethAddress: null,
      cosmosAddress: null,
      userInfo: null,
    },
    (set, get) => ({
      initKeplrSdkEth: async () => {
        const initRes = await initEthEWallet({
          // TODO: replace with actual apiKey
          api_key:
            "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
          sdk_endpoint: import.meta.env.VITE_KEPLR_EWALLET_SDK_ENDPOINT,
        });

        if (initRes.success) {
          set({ keplr_sdk_eth: initRes.data });
          return initRes.data;
        } else {
          console.error("sdk init fail");
          return null;
        }
      },
      initKeplrSdkCosmos: async () => {
        if (get().keplr_sdk_cosmos) {
          return get().keplr_sdk_cosmos;
        }

        const initRes = await initCosmosEWallet({
          // TODO: replace with actual apiKey
          api_key:
            "72bd2afd04374f86d563a40b814b7098e5ad6c7f52d3b8f84ab0c3d05f73ac6c",
          sdk_endpoint: import.meta.env.VITE_KEPLR_EWALLET_SDK_ENDPOINT,
        });

        if (initRes.success) {
          const cosmosSDK = initRes.data;
          set({ keplr_sdk_cosmos: cosmosSDK });

          cosmosSDK.on("accountsChanged", async (payload) => {
            set({
              userInfo:
                payload as KeplrCosmosEWalletEventTypeMap["accountsChanged"],
            });
          });

          return initRes.data;
        } else {
          console.error("sdk init fail");

          return null;
        }
      },
      setUserInfo: (userInfo: { email: string; publicKey: string }) => {
        set({ userInfo });
      },
      setEthAddress: (ethAddress: string) => {
        set({ ethAddress });
      },
      setCosmosAddress: (cosmosAddress: string) => {
        set({ cosmosAddress });
      },
    }),
  ),
);
